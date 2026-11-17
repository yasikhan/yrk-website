// Hand-drawn browser frames around site screenshots (.site-frame), on the websites and portfolio
// pages. Each frame is redrawn whenever it resizes.
(function () {
  if (typeof rough === 'undefined') return;
  var NS = 'http://www.w3.org/2000/svg';
  var ink = getComputedStyle(document.documentElement).getPropertyValue('--ink3').trim();

  function draw(frame, seed) {
    var w = frame.offsetWidth, h = frame.offsetHeight;
    if (!w || !h) return;
    var svg = frame.querySelector('svg') || frame.appendChild(document.createElementNS(NS, 'svg'));
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '';
    var rc = rough.svg(svg);
    var BAR = parseFloat(getComputedStyle(frame).paddingTop) - 2;
    var o = { stroke: ink, strokeWidth: 1.1, roughness: 0.8, bowing: 0.8, seed: seed };
    svg.appendChild(rc.rectangle(1, 1, w - 2, h - 2, o));
    svg.appendChild(rc.line(1, BAR, w - 1, BAR - 1, Object.assign({}, o, { seed: seed + 1, strokeWidth: 0.9 })));
    for (var i = 0; i < 3; i++) {
      svg.appendChild(rc.circle(13 + i * 12, BAR / 2 + 0.5, 6.5, Object.assign({}, o, { seed: seed + 2 + i, strokeWidth: 0.9 })));
    }
  }

  var frames = Array.prototype.slice.call(document.querySelectorAll('.site-frame'));
  var ro = new ResizeObserver(function (entries) {
    entries.forEach(function (entry) {
      var f = entry.target;
      draw(f, 20 + frames.indexOf(f) * 7);
    });
  });
  frames.forEach(function (f) { ro.observe(f); });
})();
