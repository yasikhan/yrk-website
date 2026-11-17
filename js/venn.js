// Research Venn diagram. The list below is the content: each .region-group names its
// region with data-region. A standalone .entry becomes one pencil dot in that region; an
// .entry-group becomes a tight cluster of dots with a loop drawn around it.
(function () {
  var fig = document.getElementById('venn');
  if (!fig || typeof rough === 'undefined') return;
  var svg = fig.querySelector('svg');
  var tip = document.getElementById('vennTip');
  var status = document.getElementById('vennStatus');
  var reset = document.getElementById('vennReset');
  var list = reset.closest('.research-list');
  var NS = 'http://www.w3.org/2000/svg';
  var css = getComputedStyle(document.documentElement);
  function token(name) { return css.getPropertyValue(name).trim(); }
  var ink = token('--ink'), ink3 = token('--ink3'), page = token('--page'), wash = token('--highlight');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var R = 150, W = 600, H = 530;
  var CIRCLES = [
    { key: 'democracy', x: 225, y: 195, lx: 92, ly: 50 },
    { key: 'ai', x: 375, y: 195, lx: 512, ly: 50 },
    { key: 'analytics', x: 300, y: 325, lx: 300, ly: 515 }
  ];
  var ORDER = ['all-three', 'democracy-ai', 'democracy-analytics', 'ai-analytics', 'democracy', 'ai', 'analytics'];
  var DOT = 10, STEP = 14; // dot diameter, spacing between dots in a cluster
  var LABEL_GAP = 17, LABEL_LINE = 17, CHAR = 8.2; // loop names: offset below the loop, line height, approx. glyph width

  function regionAt(x, y) {
    var m = CIRCLES.filter(function (c) { return Math.hypot(x - c.x, y - c.y) < R; });
    if (!m.length) return null;
    if (m.length === 3) return 'all-three';
    return m.map(function (c) { return c.key; }).join('-');
  }
  function circlesOf(region) {
    if (region === 'all-three') return CIRCLES;
    var keys = region.split('-');
    return CIRCLES.filter(function (c) { return keys.indexOf(c.key) > -1; });
  }
  // distance from (x, y) to the nearest circle edge
  function edgeGap(x, y) {
    return Math.min.apply(null, CIRCLES.map(function (c) { return Math.abs(Math.hypot(x - c.x, y - c.y) - R); }));
  }
  // small seeded PRNG so the marks land in the same places on every load
  function prng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function el(name, attrs, parent) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }
  // the n hex-lattice points nearest a slightly off-centre origin: a tight, round huddle
  function huddle(n) {
    var pts = [];
    for (var r = -3; r <= 3; r++) {
      for (var q = -3; q <= 3; q++) pts.push([(q + r / 2) * STEP, r * STEP * 0.866]);
    }
    pts.sort(function (a, b) { return Math.hypot(a[0] + 2, a[1] + 1) - Math.hypot(b[0] + 2, b[1] + 1); });
    pts = pts.slice(0, n);
    var cx = 0, cy = 0;
    pts.forEach(function (p) { cx += p[0] / n; cy += p[1] / n; });
    return pts.map(function (p) { return [p[0] - cx, p[1] - cy]; });
  }

  var groups = {};
  document.querySelectorAll('.region-group').forEach(function (g) { groups[g.dataset.region] = g; });

  var rc = rough.svg(svg);
  var defs = el('defs', {}, svg);
  CIRCLES.forEach(function (c) {
    el('circle', { cx: c.x, cy: c.y, r: R - 2 }, el('clipPath', { id: 'vc-' + c.key }, defs));
  });

  // one highlighter wash per region, clipped to the circles it is in and masked out of the rest
  var regions = {};
  ORDER.forEach(function (key) {
    var inside = circlesOf(key);
    var mask = el('mask', { id: 'vm-' + key, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff' }, mask);
    CIRCLES.forEach(function (c) {
      if (inside.indexOf(c) < 0) el('circle', { cx: c.x, cy: c.y, r: R - 2, fill: '#000' }, mask);
    });
    var group = groups[key];
    var count = group ? group.querySelectorAll('.entry').length : 0;
    var label = group ? group.querySelector('.region-heading').textContent : key;
    var g = el('g', {
      'class': 'venn-region', 'data-region': key, tabindex: 0, role: 'button', 'aria-pressed': 'false',
      'aria-label': label + ', ' + count + (count === 1 ? ' piece' : ' pieces')
    }, svg);
    var layer = el('g', { mask: 'url(#vm-' + key + ')' }, g);
    inside.forEach(function (c) { layer = el('g', { 'clip-path': 'url(#vc-' + c.key + ')' }, layer); });
    el('rect', { 'class': 'wash', x: 0, y: 0, width: W, height: H }, layer);
    regions[key] = { el: g, label: label, count: count, points: [] };
  });

  ORDER.forEach(function (key) {
    var mine = circlesOf(key);
    regions[key].related = ORDER.filter(function (k) {
      var theirs = circlesOf(k);
      return mine.every(function (c) { return theirs.indexOf(c) > -1; });
    });
    regions[key].total = regions[key].related.reduce(function (n, k) { return n + regions[k].count; }, 0);
    regions[key].el.setAttribute('aria-label', regions[key].label + ' and everything inside it, ' + regions[key].total + (regions[key].total === 1 ? ' piece' : ' pieces'));
  });

  // sample each region once: used for its label anchor and for placing marks
  var rand = prng(1307);
  for (var n = 0; n < 12000; n++) {
    var px = 75 + rand() * 450, py = 45 + rand() * 430, key = regionAt(px, py);
    if (key) regions[key].points.push([px, py, edgeGap(px, py)]);
  }
  ORDER.forEach(function (key) {
    var pts = regions[key].points, sx = 0, sy = 0;
    pts.forEach(function (p) { sx += p[0]; sy += p[1]; });
    regions[key].center = [sx / pts.length, sy / pts.length];
  });

  // outlines and handwritten labels, each label on a highlighter swipe
  var outlines = el('g', { 'class': 'venn-outlines', 'aria-hidden': 'true', 'pointer-events': 'none' }, svg);
  CIRCLES.forEach(function (c, i) {
    outlines.appendChild(rc.circle(c.x, c.y, R * 2, { stroke: ink, strokeWidth: 1.5, roughness: 0.55, bowing: 0.8, seed: 3 + i }));
  });
  var labels = el('g', { 'aria-hidden': 'true', 'pointer-events': 'none' }, svg);
  var swipes = el('g', {}, labels);
  var texts = CIRCLES.map(function (c) {
    var t = el('text', { x: c.lx, y: c.ly, 'text-anchor': 'middle', 'class': 'venn-label' }, labels);
    t.textContent = c.key;
    return t;
  });
  function swipe() {
    CIRCLES.forEach(function (c, i) {
      var half = texts[i].getComputedTextLength() / 2 + 4;
      swipes.appendChild(rc.line(c.lx - half, c.ly + 1, c.lx + half, c.ly - 1, {
        stroke: wash, strokeWidth: 11, roughness: 0.4, bowing: 0.6, seed: 50 + i
      }));
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(swipe); else swipe();

  // marks: a lone dot for a standalone entry, a looped huddle for a group. Bigger marks are
  // placed first, each where it has the most room from the circle edges and its neighbours.
  var markLayer = el('g', { 'class': 'venn-marks', 'aria-hidden': 'true' }, svg);
  var marks = [], dots = [];
  ORDER.forEach(function (key, ri) {
    var group = groups[key];
    if (!group) return;
    var items = Array.prototype.map.call(group.querySelectorAll(':scope > .entry, :scope > .entry-group'), function (node) {
      var entries = node.classList.contains('entry-group') ? Array.prototype.slice.call(node.querySelectorAll('.entry')) : [node];
      var item = { node: node, entries: entries, offsets: [[0, 0]], rx: 0, ry: 0, radius: DOT / 2 + 3 };
      if (entries.length > 1) {
        item.offsets = huddle(entries.length);
        var xs = item.offsets.map(function (o) { return o[0]; }), ys = item.offsets.map(function (o) { return o[1]; });
        item.rx = (Math.max.apply(null, xs) - Math.min.apply(null, xs)) / 2 + DOT / 2 + 8;
        item.ry = (Math.max.apply(null, ys) - Math.min.apply(null, ys)) / 2 + DOT / 2 + 8;
        item.radius = Math.max(item.rx, item.ry) + 2;
      }
      return item;
    });

    // Room a mark has at p: distance from the circle edges and from marks already placed. A loop's
    // name hangs below it, so the name's outline is sampled too and must stay inside the region.
    function room(item, p, lines) {
      var probes = [[p[0], p[1], item.radius]];
      (lines || []).forEach(function (line, i) {
        var y = p[1] + item.ry + LABEL_GAP + i * LABEL_LINE - 6, half = line.length * CHAR / 2;
        for (var x = -half; x <= half; x += 10) probes.push([p[0] + x, y, 8]);
      });
      var best = Infinity;
      probes.forEach(function (q) {
        if (regionAt(q[0], q[1]) !== key) { best = -Infinity; return; }
        best = Math.min(best, edgeGap(q[0], q[1]) - q[2]);
        placed.forEach(function (m) {
          m.probes.forEach(function (o) { best = Math.min(best, Math.hypot(q[0] - o[0], q[1] - o[1]) - q[2] - o[2]); });
        });
      });
      return { score: best, probes: probes };
    }
    function bestSpot(item, lines) {
      var best = null, pts = regions[key].points;
      for (var k = 0; k < 500; k++) {
        var p = pts[Math.floor(pick() * pts.length)], r = room(item, p, lines);
        if (!best || r.score > best.score) { best = r; best.p = p; }
      }
      return best;
    }

    var placed = [], pick = prng(97 + ri * 13);
    items.slice().sort(function (a, b) { return b.radius - a.radius; }).forEach(function (item) {
      var short = item.entries.length > 1 && item.node.dataset.short, spot = null;
      // try the name on one line, then wrapped onto two; if neither fits, the loop goes unnamed
      var tries = short ? [[short], short.indexOf(' ') > 0 ? short.split(/ (.*)/).slice(0, 2) : null] : [];
      for (var t = 0; t < tries.length && !spot; t++) {
        if (!tries[t]) continue;
        var s = bestSpot(item, tries[t]);
        if (s.score > 2) { spot = s; item.lines = tries[t]; }
      }
      if (!spot) spot = bestSpot(item, null);
      item.x = spot.p[0]; item.y = spot.p[1]; item.probes = spot.probes;
      placed.push(item);
    });

    items.forEach(function (item, mi) {
      var seed = 200 + ri * 40 + mi * 7;
      var g = el('g', { 'class': 'venn-mark', 'data-region': key }, markLayer);
      item.el = g;
      item.region = key;
      if (item.entries.length > 1) {
        var rx = item.rx, ry = item.ry;
        var lasso = rc.ellipse(item.x, item.y, rx * 2, ry * 2, {
          stroke: ink3, strokeWidth: 1, roughness: 1.3, bowing: 1.5, seed: seed
        });
        lasso.setAttribute('class', 'venn-lasso');
        g.appendChild(lasso);
        el('ellipse', { cx: item.x, cy: item.y, rx: rx, ry: ry, fill: 'transparent' }, g);
        item.tip = item.node.querySelector('.group-title').textContent + ' (' + item.entries.length + ')';
        item.tipY = item.y - ry;
        (item.lines || []).forEach(function (line, i) {
          var name = el('text', { x: item.x, y: item.y + ry + LABEL_GAP + i * LABEL_LINE, 'text-anchor': 'middle', 'class': 'venn-group-label' }, g);
          name.textContent = line;
        });
      }
      item.entries.forEach(function (entry, i) {
        var x = item.x + item.offsets[i][0], y = item.y + item.offsets[i][1];
        var d = el('g', { 'class': 'venn-dot' }, g);
        d.appendChild(rc.circle(x, y, DOT, {
          stroke: ink, strokeWidth: 1.1, fill: page, fillStyle: 'solid', roughness: 0.7, seed: seed + 1 + i
        }));
        el('circle', { cx: x, cy: y, r: STEP / 2, fill: 'transparent' }, d);
        var dot = { el: d, mark: item, entry: entry, x: x, y: y, title: entry.querySelector('.entry-title').textContent };
        entry.dot = dot;
        dots.push(dot);
      });
      marks.push(item);
    });
  });

  // ---- state ----
  var selected = null, hovered = null;

  function showTip(text, x, y) {
    var s = svg.getBoundingClientRect().width / W;
    tip.textContent = text;
    tip.style.left = (x * s) + 'px';
    tip.style.top = (y * s) + 'px';
    tip.classList.add('visible');
  }
  function hideTip() { tip.classList.remove('visible'); }
  function regionTip(key) { showTip(regions[key].label, regions[key].center[0], regions[key].center[1] - 14); }

  function setHover(key) {
    if (key === hovered) return;
    if (hovered) regions[hovered].related.forEach(function (k) { regions[k].el.classList.remove('is-hover'); });
    hovered = key;
    if (key) regions[key].related.forEach(function (k) { regions[k].el.classList.add('is-hover'); });
  }

  // Selecting a region also brings in every region inside all of its circles: picking ai shows
  // ai, democracy & ai, ai & analytics, and the centre; picking democracy & ai adds the centre.
  // The list leads with the region picked and works inward.
  function select(key, fromUser) {
    if (key && !regions[key]) key = null;
    selected = key;
    var related = key ? regions[key].related : [];
    ORDER.forEach(function (k) {
      var on = related.indexOf(k) > -1;
      regions[k].el.classList.toggle('is-selected', on);
      regions[k].el.setAttribute('aria-pressed', k === key ? 'true' : 'false');
      if (!groups[k]) return;
      groups[k].hidden = !!key && !on;
      groups[k].style.order = on ? circlesOf(k).length : '';
      groups[k].classList.remove('is-first');
    });
    if (key) groups[related.slice().sort(function (a, b) { return circlesOf(a).length - circlesOf(b).length; })[0]].classList.add('is-first');
    marks.forEach(function (m) { m.el.classList.toggle('is-out', !!key && related.indexOf(m.region) < 0); });
    if (key) fig.dataset.selected = key; else delete fig.dataset.selected;
    list.classList.toggle('is-filtered', !!key);
    reset.hidden = !key;
    status.textContent = key ? 'Showing ' + regions[key].total + ' in ' + regions[key].label + ' and the regions inside it' : 'Showing everything';
    if (fromUser) history.replaceState(null, '', key ? '#' + key : location.pathname);
  }

  function reveal(node) {
    node.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
    node.classList.add('is-flash');
    setTimeout(function () { node.classList.remove('is-flash'); }, 900);
  }

  function toPoint(e) {
    var p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }

  svg.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || e.target.closest('.venn-mark')) return;
    var p = toPoint(e), key = regionAt(p.x, p.y);
    setHover(key);
    svg.style.cursor = key ? 'pointer' : '';
    if (key) regionTip(key); else hideTip();
  });
  svg.addEventListener('pointerleave', function () { setHover(null); hideTip(); });
  svg.addEventListener('click', function (e) {
    if (e.target.closest('.venn-mark')) return;
    var p = toPoint(e), key = regionAt(p.x, p.y);
    if (key) select(key === selected ? null : key, true);
  });

  // keyboard: each region is a button; arrows move between them, Escape clears
  ORDER.forEach(function (key, i) {
    var g = regions[key].el;
    g.addEventListener('focus', function () { setHover(key); regionTip(key); });
    g.addEventListener('blur', function () { setHover(null); hideTip(); });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(key === selected ? null : key, true);
      } else if (/^Arrow/.test(e.key)) {
        e.preventDefault();
        var step = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
        regions[ORDER[(i + step + ORDER.length) % ORDER.length]].el.focus();
      } else if (e.key === 'Escape' && selected) {
        select(null, true);
      }
    });
  });

  // marks <-> list: hovering a loop names the group, hovering a dot names the piece
  marks.forEach(function (m) {
    m.el.addEventListener('mouseenter', function () {
      setHover(null);
      m.el.classList.add('on');
      if (m.tip) showTip(m.tip, m.x, m.tipY);
    });
    m.el.addEventListener('mouseleave', function () { m.el.classList.remove('on'); hideTip(); });
    m.el.addEventListener('click', function (e) {
      if (selected !== m.region) select(m.region, true);
      var dot = e.target.closest('.venn-dot');
      var hit = dot && dots.filter(function (d) { return d.el === dot; })[0];
      reveal(hit ? hit.entry : m.node);
    });
    if (m.tip) {
      var head = m.node.querySelector('.group-head');
      head.addEventListener('mouseenter', function () { m.el.classList.add('on'); });
      head.addEventListener('mouseleave', function () { m.el.classList.remove('on'); });
    }
  });
  dots.forEach(function (d) {
    d.el.addEventListener('mouseenter', function () { d.el.classList.add('on'); showTip(d.title, d.x, d.y - 4); });
    d.el.addEventListener('mouseleave', function () {
      d.el.classList.remove('on');
      if (d.mark.tip) showTip(d.mark.tip, d.mark.x, d.mark.tipY); else hideTip();
    });
    function on() { d.el.classList.add('on'); }
    function off() { d.el.classList.remove('on'); }
    d.entry.addEventListener('mouseenter', on);
    d.entry.addEventListener('mouseleave', off);
    d.entry.addEventListener('focusin', on);
    d.entry.addEventListener('focusout', off);
  });

  reset.addEventListener('click', function () { select(null, true); });

  select(location.hash.slice(1) || null, false);

  // one orchestrated moment: the circles draw themselves, then the marks arrive
  if (!still) {
    var beat = 260;
    outlines.querySelectorAll('path').forEach(function (p, i) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      p.getBoundingClientRect();
      p.style.transition = 'stroke-dashoffset 700ms ease-out ' + (Math.floor(i / 2) * beat + (i % 2) * 120) + 'ms';
      p.style.strokeDashoffset = 0;
    });
    marks.forEach(function (m, i) {
      var delay = 3 * beat + 400 + i * 60;
      m.el.style.opacity = 0;
      m.el.style.transition = 'opacity 260ms ease ' + delay + 'ms';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { m.el.style.opacity = ''; });
      });
      setTimeout(function () { m.el.style.transition = ''; }, delay + 400);
    });
  }
})();
