import { highlightActiveNav } from '../shared/navigation.js';

document.addEventListener('DOMContentLoaded', () => {
  highlightActiveNav();
  const iframe = document.querySelector('.pta-iframe-wrapper iframe');
  if (iframe) {
    iframe.addEventListener('load', () => {
      console.info('[PTA] Prototype libre chargé dans le hub.');
    });
  }
});
