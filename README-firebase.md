# 🔥 Configurar Firebase — Instrucciones paso a paso

Con Firebase, lo que marque papá aparece en tu pantalla al instante (y al revés).
Es completamente **gratuito** para este uso.

---

## Paso 1 — Crear el proyecto Firebase

1. Ve a **https://console.firebase.google.com**
2. Haz clic en **"Agregar proyecto"**
3. Nombre del proyecto: `nyc-trip-2026` (o el que quieras)
4. Desactiva Google Analytics (no es necesario) → **Crear proyecto**

---

## Paso 2 — Activar Realtime Database

1. En el menú izquierdo: **Compilación → Realtime Database**
2. Clic en **"Crear base de datos"**
3. Elige la ubicación: **europe-west1** (más cercana)
4. En las reglas de seguridad, selecciona **"Iniciar en modo de prueba"** → Aceptar

---

## Paso 3 — Obtener las credenciales

1. Ve al engranaje ⚙️ → **Configuración del proyecto**
2. En la pestaña **"General"**, baja hasta **"Tus apps"**
3. Haz clic en el icono `</>` (Web)
4. Nombre de la app: `nyc-web` → **Registrar app**
5. Verás un bloque de código con `firebaseConfig`. Copia esos valores.

---

## Paso 4 — Pegar las credenciales en el código

Abre el archivo `js/shops.js` y rellena el objeto `FIREBASE_CONFIG`:

```js
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",        // ← pega el tuyo
  authDomain:        "nyc-trip-2026.firebaseapp.com",
  databaseURL:       "https://nyc-trip-2026-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "nyc-trip-2026",
  storageBucket:     "nyc-trip-2026.appspot.com",
  messagingSenderId: "1234567890",
  appId:             "1:1234567890:web:abcdef..."
};
```

> ⚠️ La `databaseURL` es importante — la encuentras en
> Realtime Database → pestaña Datos → URL que aparece arriba

---

## Paso 5 — Subir a GitHub Pages

1. Sube todos los archivos al repositorio de GitHub
2. Ve a **Settings → Pages → Branch: main** → Save
3. Tu web estará en `https://TUUSUARIO.github.io/nyc-trip/`

---

## ¿Cómo funciona la sincronización?

- Cuando alguien marca una tienda → se guarda en Firebase al instante
- Firebase envía el cambio a **todos los dispositivos conectados** en tiempo real
- El indicador **"● Sincronizado"** (verde) confirma que todo está al día
- Si no hay internet → funciona en modo local con el estado que había

---

## Seguridad

Las reglas de "modo de prueba" caducan en 30 días. Antes de que caduquen,
ve a Realtime Database → Reglas y pega esto:

```json
{
  "rules": {
    "nyc2026": {
      ".read": true,
      ".write": true
    }
  }
}
```

Esto permite que cualquiera con el enlace pueda leer y escribir —
perfecto para uso familiar privado.
