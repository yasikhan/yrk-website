// Page menu in the content-page header: toggles on click, closes on Escape or an outside click.
(function() {
  var btn = document.querySelector('.page-menu-btn');
  if (!btn) return;
  var list = document.getElementById(btn.getAttribute('aria-controls'));

  function setOpen(open) {
    btn.setAttribute('aria-expanded', open);
    list.hidden = !open;
  }

  btn.addEventListener('click', function() {
    var open = btn.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
    if (open) list.querySelector('a').focus();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !list.hidden) {
      setOpen(false);
      btn.focus();
    }
  });

  document.addEventListener('click', function(e) {
    if (!list.hidden && !btn.parentNode.contains(e.target)) setOpen(false);
  });
})();
