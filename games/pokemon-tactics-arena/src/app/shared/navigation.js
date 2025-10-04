export function highlightActiveNav() {
  const navLinks = document.querySelectorAll('.pta-nav__link');
  if (!navLinks.length) {
    return;
  }

  const current = window.location.pathname.split('/').pop();
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const file = href ? href.split('/').pop() : '';
    if (file === current) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });
}

export function wirePlaceholderButton(selector, message) {
  const button = document.querySelector(selector);
  if (!button) {
    return;
  }
  button.addEventListener('click', () => {
    window.alert(message);
  });
}
