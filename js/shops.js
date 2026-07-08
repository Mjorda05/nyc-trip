// shops.js — Firebase Realtime Database
// Sincronización en tiempo real entre todos los dispositivos

// ─────────────────────────────────────────
//  🔧 CONFIGURA AQUÍ TU PROYECTO FIREBASE
//  Instrucciones: README-firebase.md
// ─────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDa67FONMLnAUjXy5hjKf58IubVU7vU9QI",
  authDomain: "nyc-trip-2026-2d01b.firebaseapp.com",
  databaseURL: "https://nyc-trip-2026-2d01b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nyc-trip-2026-2d01b",
  storageBucket: "nyc-trip-2026-2d01b.firebasestorage.app",
  messagingSenderId: "864848582214",
  appId: "1:864848582214:web:72cf2d03fd9c14ff9f5c47"
};

const DB_PATH = 'nyc2026/tiendas';
const LS_KEY  = 'nyc-shops-visited'; // fallback localStorage

let db = null; // Firebase database reference (null until initialized)

// ── Inicializar Firebase ────────────────────────────────────────────────────
function initFirebase() {
  if (FIREBASE_CONFIG.apiKey.startsWith('PEGA_AQUÍ')) {
    console.warn('[NYC] Firebase no configurado — usando localStorage');
    return false;
  }
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    return true;
  } catch (e) {
    console.error('[NYC] Error iniciando Firebase:', e);
    return false;
  }
}

// ── Escucha en tiempo real ──────────────────────────────────────────────────
// Se llama cada vez que CUALQUIER dispositivo cambia algo en Firebase.
// Así, si papá marca una tienda, a ti te aparece marcada al instante.
function listenForChanges() {
  if (!db) return;
  db.ref(DB_PATH).on('value', snapshot => {
    const visited = snapshot.val() || {};
    // Actualizar UI con el estado más reciente de la nube
    document.querySelectorAll('.shop-checkbox').forEach(cb => {
      const id = cb.dataset.shop;
      const shouldBeChecked = !!visited[id];
      if (cb.checked !== shouldBeChecked) {
        cb.checked = shouldBeChecked;
        cb.closest('.shop-card').classList.toggle('visited', shouldBeChecked);
      }
    });
    updateProgress();
    updateSyncStatus('ok');
  });
}

// ── Guardar un cambio en Firebase ───────────────────────────────────────────
async function saveChange(shopId, checked) {
  if (db) {
    try {
      updateSyncStatus('saving');
      await db.ref(`${DB_PATH}/${shopId}`).set(checked ? true : null);
      // El listener 'on value' actualizará la UI automáticamente
    } catch (e) {
      console.error('[NYC] Error guardando en Firebase:', e);
      updateSyncStatus('error');
      // Fallback: guardar en localStorage
      saveToLocal(shopId, checked);
    }
  } else {
    saveToLocal(shopId, checked);
  }
}

// ── localStorage fallback ───────────────────────────────────────────────────
function loadFromLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
}
function saveToLocal(shopId, checked) {
  const v = loadFromLocal();
  if (checked) v[shopId] = true; else delete v[shopId];
  localStorage.setItem(LS_KEY, JSON.stringify(v));
}

// ── Resetear todas las tiendas ──────────────────────────────────────────────
async function resetShops() {
  if (!confirm('¿Resetear todas las tiendas? Esto lo verán todos los dispositivos.')) return;
  if (db) {
    try {
      await db.ref(DB_PATH).remove();
    } catch (e) {
      console.error('[NYC] Error reseteando:', e);
    }
  } else {
    localStorage.removeItem(LS_KEY);
    document.querySelectorAll('.shop-checkbox').forEach(cb => {
      cb.checked = false;
      cb.closest('.shop-card').classList.remove('visited');
    });
    updateProgress();
  }
}

// ── Barra de progreso ───────────────────────────────────────────────────────
function updateProgress() {
  const total   = document.querySelectorAll('.shop-checkbox').length;
  const checked = document.querySelectorAll('.shop-checkbox:checked').length;
  const bar   = document.getElementById('progress-bar');
  const count = document.getElementById('progress-count');
  if (bar)   bar.style.width = total ? (checked / total * 100) + '%' : '0%';
  if (count) count.textContent = `${checked} / ${total}`;
}

// ── Indicador de estado de sync ─────────────────────────────────────────────
function updateSyncStatus(state) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  const states = {
    ok:     { text: '● Sincronizado',  color: '#22c55e' },
    saving: { text: '● Guardando…',    color: '#f59e0b' },
    error:  { text: '● Sin conexión',  color: '#ef4444' },
    local:  { text: '⚠ Modo local',   color: '#94a3b8' },
  };
  const s = states[state] || states.local;
  el.textContent = s.text;
  el.style.color = s.color;
}

// ── Carga inicial sin Firebase (localStorage) ───────────────────────────────
function loadLocalAndRender() {
  const visited = loadFromLocal();
  document.querySelectorAll('.shop-checkbox').forEach(cb => {
    if (visited[cb.dataset.shop]) {
      cb.checked = true;
      cb.closest('.shop-card').classList.add('visited');
    }
  });
  updateProgress();
  updateSyncStatus('local');
}

// ── Main ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const firebaseReady = initFirebase();

  // Añadir listeners a los checkboxes
  document.querySelectorAll('.shop-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const card = cb.closest('.shop-card');
      card.classList.toggle('visited', cb.checked);
      updateProgress();
      saveChange(cb.dataset.shop, cb.checked);
    });
  });

  if (firebaseReady) {
    // Firebase: escucha en tiempo real (carga inicial + cambios de otros)
    listenForChanges();
  } else {
    // Sin Firebase: usar localStorage
    loadLocalAndRender();
  }
});
