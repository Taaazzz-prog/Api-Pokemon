/*
 * Gestionnaire de thème sombre/clair
 * Ce fichier gère le basculement entre thème sombre et clair
 */

class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || 'light';
    this.init();
  }

  init() {
    // Appliquer le thème stocké
    this.applyTheme(this.currentTheme);
    
    // Créer le bouton de toggle
    this.createThemeToggle();
    
    // Écouter les changements de préférence système
    this.watchSystemTheme();
  }

  // Récupérer le thème stocké
  getStoredTheme() {
    return localStorage.getItem('pokemon-theme');
  }

  // Stocker le thème
  storeTheme(theme) {
    localStorage.setItem('pokemon-theme', theme);
  }

  // Appliquer un thème
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    this.storeTheme(theme);
    this.updateToggleButton();
    this.updateThemeAssets(theme);
  }

  // Basculer entre les thèmes
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  // Créer le bouton de basculement de thème
  createThemeToggle() {
    const toggleButton = document.createElement('button');
    toggleButton.classList.add('theme-toggle');
    toggleButton.setAttribute('aria-label', 'Basculer le thème');
    toggleButton.innerHTML = `
      <span class="theme-icon light-icon">☀️</span>
      <span class="theme-icon dark-icon">🌙</span>
    `;

    toggleButton.addEventListener('click', () => this.toggleTheme());

    const slot = document.getElementById('theme-toggle-slot');
    if (slot) {
      const container = document.createElement('div');
      container.classList.add('theme-toggle-container');
      container.appendChild(toggleButton);
      slot.appendChild(container);
    } else {
      const fallback = document.querySelector('header');
      if (fallback) {
        const container = document.createElement('div');
        container.classList.add('theme-toggle-container');
        container.appendChild(toggleButton);
        fallback.appendChild(container);
      }
    }

    this.toggleButton = toggleButton;
    this.updateToggleButton();
  }

  // Mettre à jour les ressources dépendantes du thème
  updateThemeAssets(theme) {
    const themedNodes = document.querySelectorAll('[data-light-src][data-dark-src]');
    themedNodes.forEach(node => {
      const lightSrc = node.getAttribute('data-light-src');
      const darkSrc = node.getAttribute('data-dark-src');
      const targetSrc = theme === 'dark' ? darkSrc : lightSrc;

      if (!targetSrc) {
        return;
      }

      if (node.tagName === 'SOURCE') {
        if (node.getAttribute('srcset') !== targetSrc) {
          node.setAttribute('srcset', targetSrc);
        }
      } else if (node.getAttribute('src') !== targetSrc) {
        node.setAttribute('src', targetSrc);
      }
    });
  }

  // Mettre à jour l'état du bouton
  updateToggleButton() {
    if (this.toggleButton) {
      this.toggleButton.classList.remove('light', 'dark');
      this.toggleButton.classList.add(this.currentTheme);
    }
  }

  // Surveiller les changements de thème système
  watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addListener((e) => {
        // Seulement si l'utilisateur n'a pas défini de préférence
        if (!this.getStoredTheme()) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  // Obtenir le thème actuel
  getCurrentTheme() {
    return this.currentTheme;
  }
}

// Initialiser le gestionnaire de thème
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});
