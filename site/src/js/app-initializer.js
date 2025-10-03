/*
 * Initialisation des gestionnaires principaux
 * Ce fichier s'assure que tous les gestionnaires sont initialisés dans le bon ordre
 */

class AppInitializer {
  constructor() {
    this.initializeComponents();
  }

  async initializeComponents() {
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startInitialization());
    } else {
      this.startInitialization();
    }
  }

  startInitialization() {
    console.log('🚀 Initialisation de l\'application Pokémon...');

    // Initialiser les gestionnaires dans l'ordre approprié
    setTimeout(() => {
      this.initializeFavorites();
      this.initializeComparator();
      this.initializeHistory();
      this.initializeOptimizers();
      this.setupEventListeners();
      console.log('✅ Tous les gestionnaires sont initialisés');
    }, 100);
  }

  initializeFavorites() {
    if (typeof FavoritesManager !== 'undefined' && !window.favoritesManager) {
      window.favoritesManager = new FavoritesManager();
      console.log('✅ Gestionnaire de favoris initialisé');
    }
  }

  initializeComparator() {
    if (typeof PokemonComparator !== 'undefined' && !window.pokemonComparator) {
      window.pokemonComparator = new PokemonComparator();
      console.log('✅ Comparateur de Pokémon initialisé');
    }
  }

  initializeHistory() {
    if (typeof SearchHistoryManager !== 'undefined' && !window.searchHistoryManager) {
      window.searchHistoryManager = new SearchHistoryManager();
      console.log('✅ Gestionnaire d\'historique initialisé');
    }
  }

  initializeOptimizers() {
    if (typeof ImageOptimizer !== 'undefined' && !window.imageOptimizer) {
      window.imageOptimizer = new ImageOptimizer();
      console.log('✅ Optimiseur d\'images initialisé');
    }

    if (typeof AssetMinifier !== 'undefined' && !window.assetMinifier) {
      window.assetMinifier = new AssetMinifier();
      console.log('✅ Minificateur d\'assets initialisé');
    }

    // CDN Manager désactivé temporairement pour éviter les erreurs 404
    if (typeof CDNManager !== 'undefined' && !window.cdnManager) {
      window.cdnManager = new CDNManager();
      console.log('✅ Gestionnaire CDN créé (non initialisé)');
    }
  }

  setupEventListeners() {
    // Écouter les événements de pagination pour mettre à jour les boutons
    document.addEventListener('paginationUpdate', (event) => {
      setTimeout(() => {
        this.updateActionButtons();
      }, 100);
    });

    // Mettre à jour les boutons après les opérations
    document.addEventListener('favoritesUpdated', () => {
      this.updateActionButtons();
    });

    console.log('✅ Événements configurés');
  }

  updateActionButtons() {
    // Mettre à jour tous les boutons favoris et comparaison
    document.querySelectorAll('.favorite-btn').forEach((btn) => {
      const card = btn.closest('.pokemon-card');
      if (!card || !window.favoritesManager) {
        return;
      }

      const pokemonId = Number(card.dataset.id);
      if (Number.isNaN(pokemonId)) {
        return;
      }

      const isFav = window.favoritesManager.isFavorite(pokemonId);
      btn.innerHTML = isFav ? '❤️' : '🤍';
      btn.setAttribute('aria-pressed', String(isFav));
    });

    document.querySelectorAll('.compare-btn').forEach((btn) => {
      const card = btn.closest('.pokemon-card');
      if (!card || !window.pokemonComparator) {
        return;
      }

      const pokemonId = Number(card.dataset.id);
      if (Number.isNaN(pokemonId)) {
        return;
      }

      const isSelected = window.pokemonComparator.isSelected(pokemonId);
      btn.innerHTML = isSelected ? '✓' : '⚖️';
      btn.classList.toggle('selected', isSelected);
    });

    window.pokemonComparator?.updateCompareButton?.();
  }

  // Méthode publique pour rafraîchir l'interface
  refresh() {
    this.updateActionButtons();
  }
}

// Initialiser l'application
window.appInitializer = new AppInitializer();
