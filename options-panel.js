(function() {
  function closePanel(navOptions, toggle, panel) {
    navOptions.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('hidden', '');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('options-toggle');
    const panel = document.getElementById('options-panel');
    if (!toggle || !panel) {
      return;
    }

    const navOptions = toggle.closest('.nav-options');
    if (!navOptions) {
      return;
    }

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      const isOpen = navOptions.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        panel.removeAttribute('hidden');
        const focusable = panel.querySelector('button, [href], input, select, textarea');
        if (focusable && typeof focusable.focus === 'function') {
          focusable.focus();
        }
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    document.addEventListener('click', (event) => {
      if (!navOptions.classList.contains('open')) {
        return;
      }
      if (!navOptions.contains(event.target)) {
        closePanel(navOptions, toggle, panel);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navOptions.classList.contains('open')) {
        closePanel(navOptions, toggle, panel);
        toggle.focus();
      }
    });
  });
})();
