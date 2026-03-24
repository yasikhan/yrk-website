// ============ CANVAS SETUP ============
const canvas = document.getElementById('shelfCanvas');
const scene = document.getElementById('scene');
const hoverLabel = document.getElementById('hoverLabel');
const hoverText = document.getElementById('hoverText');

// Canvas internal resolution (2x for retina)
const CW = 1840;
const CH = 1040;
canvas.width = CW;
canvas.height = CH;

const ctx = canvas.getContext('2d');
const rc = rough.canvas(canvas);

const SHELF_Y = 780;
const SEED = 77;

// Rough style presets
const ink = (s, extra = {}) => ({
  stroke: '#1a1a1a', strokeWidth: 2.2,
  roughness: 0.7, bowing: 1.0,
  seed: s, ...extra
});
const light = (s, extra = {}) => ({
  stroke: 'rgba(26,26,26,0.2)', strokeWidth: 1.0,
  roughness: 0.5, bowing: 0.6, seed: s, ...extra
});
const faint = (s, extra = {}) => ({
  stroke: 'rgba(26,26,26,0.1)', strokeWidth: 0.7,
  roughness: 0.4, bowing: 0.4, seed: s, ...extra
});

// ============ HIT REGIONS (canvas-drawn items only) ============
let hitRegions = [];
let hoveredId = null;

function addHit(id, x, y, w, h, label) {
  hitRegions.push({ id, x, y, w, h, label });
}

// ============ DRAW ============
function draw() {
  ctx.clearRect(0, 0, CW, CH);
  hitRegions = [];

  // Shelf surface
  rc.line(100, SHELF_Y, CW - 100, SHELF_Y, ink(SEED, { strokeWidth: 3.0 }));
  rc.line(100, SHELF_Y + 14, CW - 100, SHELF_Y + 14, light(SEED + 1, { strokeWidth: 1.6 }));
  rc.line(100, SHELF_Y, 100, SHELF_Y + 14, ink(SEED + 2, { strokeWidth: 2.2 }));
  rc.line(CW - 100, SHELF_Y, CW - 100, SHELF_Y + 14, ink(SEED + 3, { strokeWidth: 2.2 }));

  // === LEFT SIDE: gap for camera image, then two books ===
  drawBook(420, 96, 460, 'about me', 'about', -0.5, SEED + 100);
  drawBook(550, 84, 500, 'research', 'research', 0.4, SEED + 200);

  // === CENTER: Spiral notebook (centered at 920) ===
  drawNotebook(710, SEED + 300);

  // === RIGHT SIDE: two books, then gap for phone image ===
  drawBook(1200, 104, 480, 'writing', 'writing', 0.3, SEED + 400);
  drawBook(1340, 76, 440, 'projects', 'projects', -0.5, SEED + 500);

  // Hover highlight
  if (hoveredId) {
    const r = hitRegions.find(h => h.id === hoveredId);
    if (r) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#fded78';
      const pad = 10;
      ctx.beginPath();
      ctx.roundRect(r.x - pad, r.y - pad, r.w + pad * 2, r.h + pad * 2, 6);
      ctx.fill();
      ctx.restore();
    }
  }
}

function drawBook(bx, bw, bh, label, id, leanDeg, s) {
  const by = SHELF_Y - bh;
  ctx.save();
  const cx = bx + bw / 2;
  ctx.translate(cx, SHELF_Y);
  ctx.rotate(leanDeg * Math.PI / 180);
  ctx.translate(-cx, -SHELF_Y);

  // Book body
  rc.rectangle(bx, by, bw, bh, ink(s, {
    fill: 'rgba(26,26,26,0.012)', fillStyle: 'solid'
  }));

  // Top/bottom decorative bands
  rc.line(bx + 10, by + 16, bx + bw - 10, by + 16, light(s + 10));
  rc.line(bx + 10, by + bh - 16, bx + bw - 10, by + bh - 16, light(s + 11));

  // Spine details
  const nLines = 2 + (s % 2);
  for (let i = 0; i < nLines; i++) {
    const ly = by + 40 + i * ((bh - 80) / nLines) + (s + i * 7) % 12;
    rc.line(bx + 12, ly, bx + bw - 12, ly, faint(s + 20 + i));
  }

  // Spine label
  ctx.save();
  ctx.translate(bx + bw / 2, by + bh / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '700 36px Caveat, cursive';
  ctx.fillStyle = 'rgba(26,26,26,0.65)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);
  ctx.restore();

  ctx.restore();
  addHit(id, bx - 6, by - 6, bw + 12, bh + 12, label);
}

function drawNotebook(nx, s) {
  const nbW = 420, nbH = 340;
  const bx = nx;
  const by = SHELF_Y - nbH - 20;

  // Back cover
  rc.rectangle(bx - 6, by + 6, nbW + 12, nbH + 4, ink(s, {
    strokeWidth: 1.6,
    fill: 'rgba(26,26,26,0.055)', fillStyle: 'solid'
  }));

  // Front page (cream)
  rc.rectangle(bx, by, nbW, nbH, ink(s + 1, {
    strokeWidth: 2.0,
    fill: 'rgba(255,252,235,0.55)', fillStyle: 'solid'
  }));

  // Spiral rings along the top
  const ringCount = 14;
  const ringSpacing = (nbW - 40) / (ringCount - 1);
  for (let i = 0; i < ringCount; i++) {
    const rx = bx + 20 + i * ringSpacing;
    const ry = by - 2;
    rc.ellipse(rx, ry, 16, 22, ink(s + 30 + i, {
      strokeWidth: 1.4, roughness: 0.5, bowing: 0.6,
      fill: 'rgba(180,165,130,0.12)', fillStyle: 'solid'
    }));
  }

  // Dot grid
  ctx.save();
  ctx.fillStyle = 'rgba(26,26,26,0.07)';
  const dotSpacing = 18;
  const margin = 30;
  for (let dy = by + 55; dy < by + nbH - margin; dy += dotSpacing) {
    for (let dx = bx + margin; dx < bx + nbW - margin; dx += dotSpacing) {
      ctx.beginPath();
      ctx.arc(dx, dy, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // "currently" header
  ctx.save();
  ctx.font = '600 34px Caveat, cursive';
  ctx.fillStyle = 'rgba(26,26,26,0.6)';
  ctx.fillText('currently', bx + 34, by + 50);
  ctx.restore();

  // Underline
  rc.line(bx + 34, by + 56, bx + 175, by + 56, light(s + 50, { strokeWidth: 1.2 }));

  // Bio text with highlights
  const bioLines = [
    { t: 'I research the ideologies of Silicon', hl: true },
    { t: 'Valley. I hold an MSc with Distinction', hl: true },
    { t: 'from the University of Oxford in Social', hl: false },
    { t: 'Science of the Internet, and a Bachelor\u2019s', hl: false },
    { t: 'with Honors and Distinction from Stanford', hl: true },
    { t: 'in Symbolic Systems (Human-Centered AI).', hl: true },
    { t: '', hl: false },
    { t: 'I\u2019ve worked as an AI strategist at McKinsey', hl: false },
    { t: '& Company, and in Product & Analytics at', hl: true },
    { t: 'the Interaction Company (poke.com). I have', hl: true },
    { t: 'written for the San Francisco Giants', hl: false },
    { t: 'through Vox Media, and hold a minor', hl: false },
    { t: 'in Poetry.', hl: true },
  ];

  ctx.save();
  ctx.font = '24px Caveat, cursive';
  const lineH = 21;
  let ty = by + 82;
  const textLeft = bx + 34;
  const textRight = bx + nbW - 30;
  bioLines.forEach(line => {
    if (!line.t) { ty += lineH * 0.6; return; }
    if (line.hl) {
      const tw = Math.min(ctx.measureText(line.t).width, textRight - textLeft);
      ctx.fillStyle = 'rgba(253,237,120,0.45)';
      ctx.fillRect(textLeft - 2, ty - 17, tw + 6, 22);
    }
    ctx.fillStyle = line.hl ? 'rgba(26,26,26,0.6)' : 'rgba(26,26,26,0.38)';
    ctx.fillText(line.t, textLeft, ty);
    ty += lineH;
  });
  ctx.restore();
}

// ============ CANVAS INTERACTION ============
function canvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (CW / rect.width),
    y: (e.clientY - rect.top) * (CH / rect.height)
  };
}

function hitTest(mx, my) {
  for (let i = hitRegions.length - 1; i >= 0; i--) {
    const r = hitRegions[i];
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return r;
  }
  return null;
}

canvas.addEventListener('mousemove', e => {
  const { x, y } = canvasCoords(e);
  const hit = hitTest(x, y);
  const newId = hit ? hit.id : null;
  if (newId !== hoveredId) {
    hoveredId = newId;
    draw();
    if (hit) {
      canvas.style.cursor = 'pointer';
      hoverText.textContent = hit.label;
      hoverLabel.classList.add('visible');
    } else {
      canvas.style.cursor = 'default';
      hoverLabel.classList.remove('visible');
    }
  }
});

canvas.addEventListener('mouseleave', () => {
  if (hoveredId) { hoveredId = null; draw(); }
  hoverLabel.classList.remove('visible');
  canvas.style.cursor = 'default';
});

canvas.addEventListener('click', e => {
  const { x, y } = canvasCoords(e);
  const hit = hitTest(x, y);
  if (hit) navigateTo(hit.id);
});

// ============ HTML IMAGE OVERLAYS (camera + phone) ============
const cameraImg = document.getElementById('cameraImg');
const phoneImg = document.getElementById('phoneImg');

[cameraImg, phoneImg].forEach(el => {
  const id = el === cameraImg ? 'photography' : 'contact';
  const label = el === cameraImg ? 'photography' : 'contact me';

  el.addEventListener('mouseenter', () => {
    hoverText.textContent = label;
    hoverLabel.classList.add('visible');
  });
  el.addEventListener('mouseleave', () => {
    hoverLabel.classList.remove('visible');
  });
  el.addEventListener('click', () => navigateTo(id));
});

// ============ NAVIGATION ============
// Each section maps to its own page
const pageMap = {
  about: 'about.html',
  research: 'research.html',
  writing: 'writing.html',
  projects: 'projects.html',
  photography: 'photography.html',
  contact: 'contact.html'
};

function navigateTo(id) {
  const page = pageMap[id];
  if (page) window.location.href = page;
}

// ============ INIT ============
draw();
