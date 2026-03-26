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

// ============ HOVER LABELS ============
function bindHover(el, label) {
  el.addEventListener('mouseenter', () => {
    hoverText.textContent = label;
    hoverLabel.classList.add('visible');
  });
  el.addEventListener('mouseleave', () => {
    hoverLabel.classList.remove('visible');
  });
}

// Camera & phone (may be hidden)
const cameraImg = document.getElementById('cameraImg');
const phoneImg = document.getElementById('phoneImg');

if (cameraImg) {
  bindHover(cameraImg, 'photography');
  cameraImg.addEventListener('click', () => navigateTo('photography'));
}
if (phoneImg) {
  bindHover(phoneImg, 'contact me');
  phoneImg.addEventListener('click', () => navigateTo('contact'));
}

// Books
document.querySelectorAll('.book-img').forEach(el => {
  bindHover(el, el.dataset.label);
  el.addEventListener('click', () => navigateTo(el.dataset.nav));
});

// ============ NAVIGATION ============
const pageMap = {
  about: 'about.html',
  research: 'research.html',
  writing: 'writing.html',
  projects: 'projects.html',
  photography: 'projects.html#photography',
  contact: 'contact.html'
};

function navigateTo(id) {
  const page = pageMap[id];
  if (page) window.location.href = page;
}

// ============ INIT ============
draw();
