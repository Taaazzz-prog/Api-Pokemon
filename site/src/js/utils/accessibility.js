class AccessibilityManager {
  constructor() {
    this.focusableElements = [];
    this.currentFocusIndex = -1;
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.addAriaLabels();
    this.setupFocusManagement();
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'Tab':
          this.handleTabNavigation(e);
          break;
        case 'Escape':
          this.handleEscape(e);
          break;
        case 'Enter':
        case ' ':
          this.handleActivation(e);
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          this.handleArrowNavigation(e);
          break;
      }
    });
  }

  handleTabNavigation(e) {
    // Gérer la navigation par Tab dans les modals
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      const focusableElements = this.getFocusableElements(activeModal);
      
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab (navigation arrière)
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (navigation avant)
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  handleEscape(e) {
    // Fermer les éléments avec Escape
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      e.preventDefault();
      this.closeModal(activeModal);
    }

    const activeMenu = document.querySelector('.mobile-menu.active');
    if (activeMenu) {
      e.preventDefault();
      if (window.mobileMenuManager) {
        window.mobileMenuManager.toggleMenu();
      }
    }

    const activeSearch = document.querySelector('.advanced-search.active');
    if (activeSearch) {
      e.preventDefault();
      if (window.advancedSearchManager) {
        window.advancedSearchManager.toggleSearch();
      }
    }
  }

  handleActivation(e) {
    const target = e.target;
    
    // Activer les éléments avec Enter/Space
    if (target.matches('[role="button"]') || 
        target.matches('.pokemon-card') || 
        target.matches('.menu-item')) {
      e.preventDefault();
      target.click();
    }
  }

  handleArrowNavigation(e) {
    const pokemonGrid = document.querySelector('.pokemon-grid');
    const pokemonCards = Array.from(pokemonGrid?.querySelectorAll('.pokemon-card') || []);
    
    if (pokemonCards.length === 0) return;

    const currentCard = document.activeElement.closest('.pokemon-card');
    if (!currentCard) return;

    const currentIndex = pokemonCards.indexOf(currentCard);
    const cardsPerRow = this.getCardsPerRow();
    let nextIndex = currentIndex;

    switch(e.key) {
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex - cardsPerRow;
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = currentIndex + cardsPerRow;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentIndex + 1;
        break;
    }

    // Vérifier les limites
    if (nextIndex >= 0 && nextIndex < pokemonCards.length) {
      pokemonCards[nextIndex].focus();
    }
  }

  getCardsPerRow() {
    const gridContainer = document.querySelector('.pokemon-grid');
    if (!gridContainer) return 4; // Valeur par défaut

    const computedStyle = window.getComputedStyle(gridContainer);
    const gridTemplateColumns = computedStyle.gridTemplateColumns;
    
    if (gridTemplateColumns && gridTemplateColumns !== 'none') {
      return gridTemplateColumns.split(' ').length;
    }

    // Fallback basé sur la largeur de l'écran
    const screenWidth = window.innerWidth;
    if (screenWidth < 576) return 1;
    if (screenWidth < 768) return 2;
    if (screenWidth < 992) return 3;
    return 4;
  }

  addAriaLabels() {
    // Ajouter des labels ARIA manquants
    const elementsToLabel = [
      {
        selector: '.hamburger-menu',
        label: 'Ouvrir le menu de navigation'
      },
      {
        selector: '.theme-toggle',
        label: 'Basculer entre le thème clair et sombre'
      },
      {
        selector: '.favorites-btn',
        label: 'Ouvrir la liste des favoris'
      },
      {
        selector: '.search-btn',
        label: 'Ouvrir la recherche avancée'
      },
      {
        selector: '.pokemon-card',
        label: (el) => {
          const name = el.querySelector('h3')?.textContent || 'Pokémon';
          const id = el.querySelector('.pokemon-id')?.textContent || '';
          return `${name} ${id} - Voir les détails`;
        }
      }
    ];

    elementsToLabel.forEach(item => {
      const elements = document.querySelectorAll(item.selector);
      elements.forEach(el => {
        if (!el.getAttribute('aria-label')) {
          const label = typeof item.label === 'function' ? 
            item.label(el) : item.label;
          el.setAttribute('aria-label', label);
        }
      });
    });
  }

  setupFocusManagement() {
    // Rendre les cartes Pokémon focusables
    const pokemonCards = document.querySelectorAll('.pokemon-card');
    pokemonCards.forEach(card => {
      if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
      }
    });

    // Gestion du focus pour les modals
    document.addEventListener('modal:opened', (e) => {
      const modal = e.detail.modal;
      this.trapFocus(modal);
    });

    document.addEventListener('modal:closed', (e) => {
      const previousFocus = e.detail.previousFocus;
      if (previousFocus) {
        previousFocus.focus();
      }
    });
  }

  getFocusableElements(container) {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])'
    ];

    return Array.from(container.querySelectorAll(selectors.join(', ')))
      .filter(el => this.isVisible(el));
  }

  isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null;
  }

  trapFocus(container) {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  closeModal(modal) {
    modal.classList.remove('active');
    
    // Dispatch event pour notifier la fermeture
    const event = new CustomEvent('modal:closed', {
      detail: {
        modal: modal,
        previousFocus: modal.dataset.previousFocus ? 
          document.querySelector(modal.dataset.previousFocus) : null
      }
    });
    document.dispatchEvent(event);
  }

  // Méthode pour annoncer les changements dynamiques
  announceToScreenReader(message, priority = 'polite') {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    // Supprimer après l'annonce
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }

  // Méthode pour mettre à jour les descriptions
  updateAriaDescriptions() {
    // Mettre à jour le nombre de résultats
    const pokemonCount = document.querySelectorAll('.pokemon-card').length;
    this.announceToScreenReader(
      `${pokemonCount} Pokémons affichés`, 
      'polite'
    );
  }
}

// Initialiser le gestionnaire d'accessibilité
window.addEventListener('DOMContentLoaded', () => {
  window.accessibilityManager = new AccessibilityManager();
});

// Export pour utilisation dans d'autres modules
window.AccessibilityManager = AccessibilityManager;
