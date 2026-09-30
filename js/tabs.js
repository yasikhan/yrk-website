// Tabbed sections (research, writing). Each .section-tab names its panel by
// data-section; the open tab is mirrored into the URL hash so it can be shared.
(function() {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.section-tab'));
  if (!tabs.length) return;

  function select(tab, updateHash) {
    tabs.forEach(function(t) {
      var on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.dataset.section).classList.toggle('active', on);
    });
    if (updateHash) history.replaceState(null, '', '#' + tab.dataset.section);
  }

  tabs.forEach(function(tab, i) {
    tab.addEventListener('click', function() { select(tab, true); });
    tab.addEventListener('keydown', function(e) {
      var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      var next = tabs[(i + step + tabs.length) % tabs.length];
      select(next, true);
      next.focus();
    });
  });

  var fromHash = location.hash && tabs.filter(function(t) {
    return t.dataset.section === location.hash.slice(1);
  })[0];
  select(fromHash || tabs.filter(function(t) { return t.classList.contains('active'); })[0] || tabs[0], false);
  // A hash matching a panel id makes the browser jump to it, and that jump can land after
  // this script runs, so reset again once the page has loaded.
  if (fromHash) {
    window.scrollTo(0, 0);
    window.addEventListener('load', function() {
      requestAnimationFrame(function() { window.scrollTo(0, 0); });
    });
  }
})();
