/*
 * Gestionnaire de favoris pour les Pokémon
 * Ce fichier gère la sauvegarde et l'affichage des Pokémon favoris
 */

class FavoritesManager {
  constructor() {
    this.favorites = this.loadFavorites();
    this.setupOptionsSection();
    this.createFavoritesModal();
    this.updateFavoriteButtons();
  }

  // Charger les favoris depuis localStorage
  loadFavorites() {
    const stored = localStorage.getItem('pokemon-favorites');
    return stored ? JSON.parse(stored) : [];
  }

  // Sauvegarder les favoris dans localStorage
  saveFavorites() {
    localStorage.setItem('pokemon-favorites', JSON.stringify(this.favorites));
  }

  // Ajouter un Pokémon aux favoris
  addToFavorites(pokemon) {
    if (!this.isFavorite(pokemon.id)) {
      this.favorites.push({
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.image,
        types: pokemon.apiTypes?.map(type => type.name) || [],
        addedAt: new Date().toISOString()
      });
      this.saveFavorites();
      this.updateFavoriteButtons();
      this.showNotification(`${pokemon.name} ajouté aux favoris ✨`);
      this.emitUpdate();
    }
  }

  // Retirer un Pokémon des favoris
  removeFromFavorites(pokemonId) {
    const index = this.favorites.findIndex(fav => fav.id === pokemonId);
    if (index !== -1) {
      const pokemon = this.favorites[index];
      this.favorites.splice(index, 1);
      this.saveFavorites();
      this.updateFavoriteButtons();
      this.showNotification(`${pokemon.name} retiré des favoris 💔`);
      this.emitUpdate();
    }
  }

  // Vérifier si un Pokémon est en favori
  isFavorite(pokemonId) {
    return this.favorites.some(fav => fav.id === pokemonId);
  }

  // Basculer le statut favori d'un Pokémon
  toggleFavorite(pokemon) {
    if (this.isFavorite(pokemon.id)) {
      this.removeFromFavorites(pokemon.id);
    } else {
      this.addToFavorites(pokemon);
    }
  }

  setupOptionsSection() {
    this.favButton = document.getElementById('favorites-btn');
    this.favoritesBadge = document.querySelector('[data-favorites-count]');
    this.favoritesSummary = document.getElementById('favorites-summary');

    if (this.favButton) {
      this.favButton.addEventListener('click', () => this.showFavoritesModal());
      this.favButton.setAttribute('aria-haspopup', 'dialog');
      this.favButton.setAttribute('aria-expanded', 'false');
    }

    this.updateFavoritesCounter();
  }

  // Créer la modal des favoris
  createFavoritesModal() {
    const modal = document.createElement('div');
    modal.classList.add('favorites-modal');
    modal.innerHTML = `
      <div class="favorites-modal-content">
        <div class="favorites-header">
          <h2>❤️ Mes Pokémon Favoris</h2>
          <button class="close-favorites" aria-label="Fermer">✕</button>
        </div>
        <div class="favorites-stats">
          <p>${this.favorites.length} Pokémon en favoris</p>
        </div>
        <div class="favorites-grid" id="favorites-grid">
          <!-- Les favoris seront ajoutés ici -->
        </div>
        <div class="favorites-actions">
          <button class="clear-favorites-btn">🗑️ Vider les favoris</button>
          <button class="export-favorites-btn">📤 Exporter</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Événements de la modal
    modal.querySelector('.close-favorites').addEventListener('click', () => this.hideFavoritesModal());
    modal.querySelector('.clear-favorites-btn').addEventListener('click', () => this.clearAllFavorites());
    modal.querySelector('.export-favorites-btn').addEventListener('click', () => this.exportFavorites());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hideFavoritesModal();
    });

    this.favModal = modal;
  }

  // Afficher la modal des favoris
  showFavoritesModal() {
    this.updateFavoritesGrid();

    const navOptions = document.querySelector('.nav-options');
    const optionsPanel = document.getElementById('options-panel');
    const optionsToggle = document.getElementById('options-toggle');
    if (navOptions?.classList.contains('open') && optionsPanel && optionsToggle) {
      navOptions.classList.remove('open');
      optionsPanel.setAttribute('hidden', '');
      optionsToggle.setAttribute('aria-expanded', 'false');
    }

    this.favModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (this.favButton) {
      this.favButton.setAttribute('aria-expanded', 'true');
    }
  }

  // Masquer la modal des favoris
  hideFavoritesModal() {
    this.favModal.style.display = 'none';
    document.body.style.overflow = '';
    if (this.favButton) {
      this.favButton.setAttribute('aria-expanded', 'false');
    }
  }

  // Mettre à jour la grille des favoris
  updateFavoritesGrid() {
    const grid = this.favModal.querySelector('#favorites-grid');
    const stats = this.favModal.querySelector('.favorites-stats p');
    
    stats.textContent = `${this.favorites.length} Pokémon en favoris`;

    if (this.favorites.length === 0) {
      grid.innerHTML = `
        <div class="no-favorites">
          <span style="font-size: 3em;">💔</span>
          <p>Aucun Pokémon en favoris</p>
          <p>Cliquez sur le ❤️ d'un Pokémon pour l'ajouter !</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = '';
    this.favorites.forEach(pokemon => {
      const card = document.createElement('div');
      card.classList.add('favorite-card');
      card.innerHTML = `
        <img src="${pokemon.image}" alt="${pokemon.name}" />
        <h3>${pokemon.name}</h3>
        <p>#${pokemon.id}</p>
        <div class="favorite-types">
          ${pokemon.types.map(type => `<span class="type-${type.toLowerCase()}">${type}</span>`).join('')}
        </div>
        <button class="remove-favorite" data-id="${pokemon.id}">❌</button>
      `;
      
      card.querySelector('.remove-favorite').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeFromFavorites(pokemon.id);
        this.updateFavoritesGrid();
      });

      grid.appendChild(card);
    });
  }

  // Mettre à jour tous les boutons de favoris
  updateFavoriteButtons() {
    this.updateFavoritesCounter();

    document.querySelectorAll('.pokemon-card').forEach(card => {
      const button = card.querySelector('.favorite-btn');
      if (!button) {
        return;
      }

      const pokemonId = parseInt(card.dataset.id, 10);
      if (Number.isNaN(pokemonId)) {
        return;
      }

      const isFav = this.isFavorite(pokemonId);
      button.innerHTML = isFav ? '❤️' : '🤍';
      button.classList.toggle('active', isFav);
      button.setAttribute('aria-pressed', String(isFav));
    });
  }

  updateFavoritesCounter() {
    const count = this.favorites.length;

    if (this.favoritesBadge) {
      this.favoritesBadge.textContent = count;
    }

    if (this.favoritesSummary) {
      this.favoritesSummary.textContent = count === 0
        ? 'Aucun favori enregistré'
        : `${count} favori${count > 1 ? 's' : ''} enregistré${count > 1 ? 's' : ''}`;
    }

    if (this.favButton) {
      this.favButton.setAttribute('aria-label', `Ouvrir mes favoris (${count})`);
    }
  }

  // Basculer favori depuis une carte
  toggleFavoriteFromCard(card) {
    const pokemonId = parseInt(card.dataset.id, 10);
    if (Number.isNaN(pokemonId)) {
      return;
    }
    const pokemonName = card.querySelector('h3').textContent;
    const imgEl = card.querySelector('img');
    const pokemonImage = imgEl?.dataset?.src || imgEl?.src;
    const types = card.dataset.types ? card.dataset.types.split(',') : [];

    const pokemon = {
      id: pokemonId,
      name: pokemonName,
      image: pokemonImage,
      apiTypes: types.map(type => ({ name: type }))
    };

    this.toggleFavorite(pokemon);
  }

  // Vider tous les favoris
  clearAllFavorites() {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous vos favoris ?')) {
      this.favorites = [];
      this.saveFavorites();
      this.updateFavoriteButtons();
      this.updateFavoritesGrid();
      this.showNotification('Tous les favoris ont été supprimés 🗑️');
      this.emitUpdate();
    }
  }

  // Exporter les favoris
  exportFavorites() {
    const dataStr = JSON.stringify(this.favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokemon-favoris-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.showNotification('Favoris exportés ! 📤');
  }

  // Afficher une notification
  showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animation d'apparition
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Suppression automatique
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Obtenir les favoris
  getFavorites() {
    return this.favorites;
  }

  emitUpdate() {
    document.dispatchEvent(new CustomEvent('favoritesUpdated', {
      detail: { count: this.favorites.length }
    }));
  }
}

// Initialiser le gestionnaire de favoris
document.addEventListener('DOMContentLoaded', () => {
  if (!window.favoritesManager) {
    window.favoritesManager = new FavoritesManager();
  }
});
