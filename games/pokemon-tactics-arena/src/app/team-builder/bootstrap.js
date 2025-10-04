import { highlightActiveNav, wirePlaceholderButton } from '../shared/navigation.js';

document.addEventListener('DOMContentLoaded', () => {
  highlightActiveNav();
  wirePlaceholderButton('#team-builder-placeholder', 'Gestion d\'équipe en cours de construction. Revenez bientôt !');
  console.info('[PTA] Page Gestion d\'équipe — module en préparation.');
});
