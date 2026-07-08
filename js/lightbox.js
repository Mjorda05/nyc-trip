// lightbox.js — click any gallery image to zoom, arrows to navigate between them

document.addEventListener('DOMContentLoaded', () => {
  const images = Array.from(document.querySelectorAll('.photo-gallery img'));
  if (!images.length) return;

  let current = 0;

  // Build overlay: backdrop > inner(prev btn · img · next btn) + close + counter
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <span class="lightbox-close">×</span>
    <div class="lightbox-inner">
      <button class="lightbox-arrow lightbox-prev" aria-label="Anterior">&#8249;</button>
      <img />
      <button class="lightbox-arrow lightbox-next" aria-label="Siguiente">&#8250;</button>
    </div>
    <div class="lightbox-counter"></div>
  `;
  document.body.appendChild(overlay);

  const lbImg     = overlay.querySelector('img');
  const lbPrev    = overlay.querySelector('.lightbox-prev');
  const lbNext    = overlay.querySelector('.lightbox-next');
  const lbCounter = overlay.querySelector('.lightbox-counter');

  function show(index) {
    current = (index + images.length) % images.length;
    lbImg.src = images[current].src.replace(/w=\d+/, 'w=1400');
    lbImg.alt = images[current].alt;
    const single = images.length < 2;
    lbPrev.style.visibility = single ? 'hidden' : '';
    lbNext.style.visibility = single ? 'hidden' : '';
    lbCounter.textContent = single ? '' : `${current + 1} / ${images.length}`;
  }

  function open(index) {
    show(index);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  images.forEach((img, i) => img.addEventListener('click', () => open(i)));

  lbPrev.addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
  lbNext.addEventListener('click', e => { e.stopPropagation(); show(current + 1); });

  // Close on backdrop click or ×  (not on inner content)
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.classList.contains('lightbox-close')) close();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Touch swipe
  let touchStartX = null;
  overlay.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  overlay.addEventListener('touchend',   e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) dx < 0 ? show(current + 1) : show(current - 1);
    touchStartX = null;
  });
});
