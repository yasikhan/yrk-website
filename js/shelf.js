// ============ CANVAS SETUP (shelf line only) ============
const canvas = document.getElementById('shelfCanvas');
const hoverLabel = document.getElementById('hoverLabel');
const hoverText = document.getElementById('hoverText');

const CW = 1840;
const CH = 1040;
canvas.width = CW;
canvas.height = CH;

const rc = rough.canvas(canvas);

const SHELF_Y = 780;
const SEED = 77;

const ink = (s, extra = {}) => ({
  stroke: '#1a1a1a', strokeWidth: 2.2,
  roughness: 0.7, bowing: 1.0,
  seed: s, ...extra
});
const light = (s, extra = {}) => ({
  stroke: 'rgba(26,26,26,0.2)', strokeWidth: 1.0,
  roughness: 0.5, bowing: 0.6, seed: s, ...extra
});

// ============ DRAW SHELF ============
function draw() {
  // Shelf surface
  rc.line(100, SHELF_Y, CW - 100, SHELF_Y, ink(SEED, { strokeWidth: 3.0 }));
  rc.line(100, SHELF_Y + 14, CW - 100, SHELF_Y + 14, light(SEED + 1, { strokeWidth: 1.6 }));
  rc.line(100, SHELF_Y, 100, SHELF_Y + 14, ink(SEED + 2, { strokeWidth: 2.2 }));
  rc.line(CW - 100, SHELF_Y, CW - 100, SHELF_Y + 14, ink(SEED + 3, { strokeWidth: 2.2 }));
}

// ============ HOVER / FOCUS LABELS ============
// Navigation is handled by the <a> elements themselves.
function bindLabel(el) {
  const show = () => {
    hoverText.textContent = el.dataset.label;
    hoverLabel.classList.add('visible');
  };
  const hide = () => hoverLabel.classList.remove('visible');
  el.addEventListener('mouseenter', show);
  el.addEventListener('focus', show);
  el.addEventListener('mouseleave', hide);
  el.addEventListener('blur', hide);
}

document.querySelectorAll('.scene-img').forEach(bindLabel);

// ============ INIT ============
draw();
