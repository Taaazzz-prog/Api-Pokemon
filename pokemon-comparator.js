class PokemonComparator {
  constructor() {
    this.selectedPokemons = new Set(); // Utiliser un Set pour les vérifications rapides
    this.selectedPokemonsList = []; // Utiliser un tableau pour l'ordre et les méthodes
    this.maxComparison = 4; // Maximum 4 Pokémons à comparer
    this.init();
  }

  getPokemonId(pokemon) {
    const rawId = pokemon?.id ?? pokemon?.pokedexId;
    const numericId = Number(rawId);
    return Number.isNaN(numericId) ? null : numericId;
  }

  normalizePokemon(pokemon) {
    const id = this.getPokemonId(pokemon);
    if (id === null) {
      return null;
    }

    const safeStats = {
      HP: pokemon.stats?.HP ?? pokemon.stats?.hp ?? 0,
      attack: pokemon.stats?.attack ?? 0,
      defense: pokemon.stats?.defense ?? 0,
      special_attack: pokemon.stats?.special_attack ?? pokemon.stats?.specialAttack ?? 0,
      special_defense: pokemon.stats?.special_defense ?? pokemon.stats?.specialDefense ?? 0,
      speed: pokemon.stats?.speed ?? 0
    };

    const image = pokemon.image || pokemon.sprite || './image/inconnu.png';

    return {
      id,
      name: pokemon.name || `Pokémon #${id}`,
      image,
      apiTypes: (pokemon.apiTypes || []).map(type => ({ name: type.name || type })),
      stats: safeStats
    };
  }

  isSelected(pokemonId) {
    return this.selectedPokemons.has(Number(pokemonId));
  }

  // Méthode utilitaire pour synchroniser Set et Array
  syncSelections() {
    this.selectedPokemons.clear();
    this.selectedPokemonsList.forEach(pokemon => {
      const id = this.getPokemonId(pokemon);
      if (id !== null) {
        this.selectedPokemons.add(id);
      }
    });
  }

  init() {
    this.createComparatorInterface();
    this.setupEventListeners();
    this.loadFromStorage();
  }

  createComparatorInterface() {
    // Vérifier si la modal existe déjà
    let modal = document.getElementById('comparison-modal');
    if (!modal) {
      // Modal de comparaison
      modal = document.createElement('div');
      modal.id = 'comparison-modal';
      modal.className = 'modal comparison-modal';
      modal.innerHTML = `
        <div class="modal-content comparison-content">
          <div class="modal-header">
            <h2>🔍 Comparateur de Pokémons</h2>
            <button class="modal-close" aria-label="Fermer">&times;</button>
          </div>
          
          <div class="comparison-controls">
            <button class="btn btn-secondary clear-comparison">
              🗑️ Vider la sélection
            </button>
            <button class="btn btn-primary export-comparison">
              📊 Exporter PDF
            </button>
          </div>

          <div class="comparison-grid" id="comparison-grid">
            <div class="empty-comparison">
              <p>Sélectionnez des Pokémons à comparer en cliquant sur le bouton ⚖️ sur leurs cartes</p>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
    }
  }

  setupEventListeners() {
    // Attendre que le DOM soit chargé pour attacher les événements
    const attachEvents = () => {
      // Fermer le modal
      const closeBtn = document.querySelector('#comparison-modal .modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.closeComparator();
        });
      }

      // Vider la sélection
      const clearBtn = document.querySelector('.clear-comparison');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.clearSelection();
        });
      }

      // Exporter en PDF
      const exportBtn = document.querySelector('.export-comparison');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          this.exportToPDF();
        });
      }
    };

    // Attacher les événements maintenant ou quand le DOM sera prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachEvents);
    } else {
      attachEvents();
    }

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('comparison-modal');
        if (modal && modal.classList.contains('active')) {
          this.closeComparator();
        }
      }
    });

  }

  togglePokemonSelection(pokemon, card) {
    const pokemonId = this.getPokemonId(pokemon);
    if (pokemonId === null) {
      console.warn('Impossible de comparer: identifiant introuvable', pokemon);
      return;
    }

    const isSelected = this.selectedPokemons.has(pokemonId);

    if (isSelected) {
      this.removePokemon(pokemonId);
      if (card) {
        this.updateCardSelection(card, false);
      }
    } else {
      if (this.selectedPokemonsList.length >= this.maxComparison) {
        this.showNotification(`Maximum ${this.maxComparison} Pokémons pour la comparaison`, 'warning');
        return;
      }

      this.addPokemon(pokemon);
      if (card) {
        this.updateCardSelection(card, true);
      }
    }

    this.updateUI();
    this.saveToStorage();
    this.renderComparisonIfOpen();
  }

  addPokemon(pokemon) {
    const normalized = this.normalizePokemon(pokemon);
    if (!normalized) {
      return;
    }

    if (this.selectedPokemons.has(normalized.id)) {
      return;
    }

    this.selectedPokemonsList.push(normalized);
    this.selectedPokemons.add(normalized.id);
  }

  removePokemon(pokemonId) {
    this.selectedPokemonsList = this.selectedPokemonsList.filter(p => this.getPokemonId(p) !== pokemonId);
    this.selectedPokemons.delete(pokemonId);
  }

  updateCardSelection(card, isSelected) {
    if (!card) {
      return;
    }

    const compareBtn = card.querySelector('.compare-btn');
    if (compareBtn) {
      compareBtn.classList.toggle('selected', isSelected);
      compareBtn.innerHTML = isSelected ? '✓' : '⚖️';
      compareBtn.title = isSelected ? 'Retirer de la comparaison' : 'Ajouter à la comparaison';
    }

    card.classList.toggle('selected-for-comparison', isSelected);
  }

  updateCompareButton() {
    document.querySelectorAll('#compare-btn').forEach(btn => {
      const count = btn.querySelector('.compare-count');
      if (count) {
        count.textContent = this.selectedPokemonsList.length;
      }

      btn.classList.toggle('has-selection', this.selectedPokemonsList.length > 0);
      btn.disabled = false;
    });
  }

  openComparator() {
    const modal = document.getElementById('comparison-modal');
    if (!modal) {
      console.error('Modal de comparaison non trouvée');
      return;
    }

    modal.classList.add('active');
    
    if (this.selectedPokemonsList.length === 0) {
      // Afficher un message informatif au lieu d'empêcher l'ouverture
      const grid = document.getElementById('comparison-grid');
      if (grid) {
        grid.innerHTML = `
          <div class="empty-comparison">
            <h3>🔍 Aucun Pokémon sélectionné</h3>
            <p>Pour comparer des Pokémon :</p>
            <ol style="text-align: left; margin: 20px auto; max-width: 300px;">
              <li>Allez sur la page <a href="liste.html" style="color: #007bff;">Pokédex</a></li>
              <li>Cliquez sur le bouton ⚖️ sur les cartes Pokémon</li>
              <li>Revenez ici pour voir la comparaison</li>
            </ol>
            <button onclick="window.location.href='liste.html'" style="
              background: #007bff; 
              color: white; 
              border: none; 
              padding: 10px 20px; 
              border-radius: 5px; 
              cursor: pointer;
              margin-top: 15px;
            ">📋 Aller au Pokédex</button>
          </div>
        `;
      }
    } else {
      this.renderComparison();
    }
    
    // Focus management
    const firstFocusable = modal.querySelector('button');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  showModal() {
    this.openComparator();
  }

  closeComparator() {
    const modal = document.getElementById('comparison-modal');
    modal.classList.remove('active');
  }

  renderComparison() {
    const grid = document.getElementById('comparison-grid');
    
    if (this.selectedPokemonsList.length === 0) {
      grid.innerHTML = `
        <div class="empty-comparison">
          <p>Sélectionnez des Pokémons à comparer en cliquant sur le bouton ⚖️ sur leurs cartes</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = `
      <div class="comparison-header">
        <div class="stat-label">Pokémon</div>
        ${this.selectedPokemonsList.map(pokemon => `
          <div class="pokemon-header">
            <img src="${pokemon.image}" alt="${pokemon.name}" loading="lazy">
            <h3>${pokemon.name}</h3>
            <p class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</p>
            <div class="pokemon-types">
              ${pokemon.apiTypes.map(type => `
                <span class="type-badge type-${type.name.toLowerCase()}">${type.name}</span>
              `).join('')}
            </div>
            <button class="remove-from-comparison" data-id="${pokemon.id}" title="Retirer">
              🗑️
            </button>
          </div>
        `).join('')}
      </div>
      
      <div class="comparison-stats">
        ${this.renderStatComparison('HP')}
        ${this.renderStatComparison('attack', 'Attaque')}
        ${this.renderStatComparison('defense', 'Défense')}
        ${this.renderStatComparison('special_attack', 'Att. Spé.')}
        ${this.renderStatComparison('special_defense', 'Déf. Spé.')}
        ${this.renderStatComparison('speed', 'Vitesse')}
      </div>
      
      <div class="comparison-summary">
        <h3>🏆 Résumé</h3>
        <div class="summary-grid">
          ${this.generateSummary()}
        </div>
      </div>
    `;

    // Ajouter les événements pour supprimer des Pokémons
    grid.querySelectorAll('.remove-from-comparison').forEach(btn => {
      btn.addEventListener('click', () => {
        const pokemonId = Number(btn.dataset.id);
        if (Number.isNaN(pokemonId)) {
          return;
        }
        this.removePokemon(pokemonId);
        this.updateUI();
        this.renderComparison();
      });
    });
  }

  renderComparisonIfOpen() {
    const modal = document.getElementById('comparison-modal');
    if (modal?.classList.contains('active')) {
      this.renderComparison();
    }
  }

  renderStatComparison(statKey, statLabel = null) {
    const label = statLabel || statKey;
    const values = this.selectedPokemonsList.map(p => p.stats[statKey] || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    return `
      <div class="stat-row">
        <div class="stat-label">${label}</div>
        ${this.selectedPokemonsList.map((pokemon, index) => {
          const value = pokemon.stats[statKey] || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isMax = value === maxValue && maxValue > 0;
          const isMin = value === minValue && values.length > 1;
          
          return `
            <div class="stat-value ${isMax ? 'best' : ''} ${isMin ? 'worst' : ''}">
              <div class="stat-bar">
                <div class="stat-fill" style="width: ${percentage}%"></div>
              </div>
              <span class="stat-number">${value}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  generateSummary() {
    if (this.selectedPokemonsList.length < 2) {
      return '<p>Ajoutez plus de Pokémons pour voir la comparaison</p>';
    }

    const stats = ['HP', 'attack', 'defense', 'special_attack', 'special_defense', 'speed'];
    const statLabels = {
      HP: 'HP',
      attack: 'Attaque',
      defense: 'Défense',
      special_attack: 'Att. Spé.',
      special_defense: 'Déf. Spé.',
      speed: 'Vitesse'
    };

    let summary = '';

    stats.forEach(stat => {
      const values = this.selectedPokemonsList.map(p => ({ 
        name: p.name, 
        value: p.stats[stat] || 0 
      }));
      
      const sorted = values.sort((a, b) => b.value - a.value);
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];

      if (best.value > 0) {
        summary += `
          <div class="summary-item">
            <strong>${statLabels[stat]}</strong><br>
            🥇 ${best.name} (${best.value})
            ${best.value !== worst.value ? `<br>🥉 ${worst.name} (${worst.value})` : ''}
          </div>
        `;
      }
    });

    return summary || '<p>Données statistiques non disponibles</p>';
  }

  clearSelection() {
    this.selectedPokemonsList = [];
    this.selectedPokemons.clear();
    this.updateUI();
    this.saveToStorage();
    this.renderComparisonIfOpen();
  }

  updateUI() {
    // Mettre à jour toutes les cartes
    document.querySelectorAll('.pokemon-card').forEach(card => {
      const id = Number(card.dataset.id);
      const isSelected = !Number.isNaN(id) && this.selectedPokemons.has(id);
      this.updateCardSelection(card, isSelected);
    });
    
    this.updateCompareButton();
  }

  async exportToPDF() {
    if (this.selectedPokemonsList.length === 0) {
      this.showNotification('Aucun Pokémon à exporter', 'warning');
      return;
    }

    try {
      // Créer le contenu à exporter
      const content = this.generateExportContent();
      
      // Utiliser l'API de partage si disponible
      if (navigator.share) {
        await navigator.share({
          title: 'Comparaison Pokémons',
          text: content,
          files: []
        });
      } else {
        // Fallback: copier dans le presse-papiers
        await navigator.clipboard.writeText(content);
        this.showNotification('Comparaison copiée dans le presse-papiers !', 'success');
      }
    } catch (error) {
      console.error('Erreur export:', error);
      this.showNotification('Erreur lors de l\'export', 'error');
    }
  }

  generateExportContent() {
    let content = '🔍 COMPARAISON POKÉMONS\n\n';
    
    this.selectedPokemonsList.forEach((pokemon, index) => {
      content += `${index + 1}. ${pokemon.name} (#${pokemon.id})\n`;
      content += `   Types: ${pokemon.apiTypes.map(t => t.name).join(', ')}\n`;
      content += `   HP: ${pokemon.stats.HP || 0}\n`;
      content += `   Attaque: ${pokemon.stats.attack || 0}\n`;
      content += `   Défense: ${pokemon.stats.defense || 0}\n`;
      content += `   Att. Spé.: ${pokemon.stats.special_attack || 0}\n`;
      content += `   Déf. Spé.: ${pokemon.stats.special_defense || 0}\n`;
      content += `   Vitesse: ${pokemon.stats.speed || 0}\n\n`;
    });

    content += `Généré le ${new Date().toLocaleDateString('fr-FR')} par Pokédex App`;
    return content;
  }

  saveToStorage() {
    try {
      localStorage.setItem('pokemon-comparison', JSON.stringify({
        selectedIds: this.selectedPokemonsList.map(p => p.id),
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Erreur sauvegarde comparaison:', error);
    }
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('pokemon-comparison');
      if (saved) {
        const data = JSON.parse(saved);
        
        // Vérifier que les données ne sont pas trop anciennes (24h)
        const isRecent = (Date.now() - data.timestamp) < 24 * 60 * 60 * 1000;
        
        if (isRecent && Array.isArray(data.selectedIds)) {
          this.pendingIds = data.selectedIds
            .map(Number)
            .filter(id => !Number.isNaN(id));

          // Essayer de charger immédiatement si les données sont disponibles
          setTimeout(() => this.restoreSelection(), 2000);
        }
      }
    } catch (error) {
      console.error('Erreur chargement comparaison:', error);
    }
  }

  restoreSelection() {
    if (!this.pendingIds || !window.pokemonManager?.pokemons) return;

    this.pendingIds.forEach(id => {
      const pokemon = window.pokemonManager.pokemons.find(p => this.getPokemonId(p) === id);
      if (pokemon) {
        this.addPokemon(pokemon);
      }
    });

    this.pendingIds = null;
    this.updateUI();
  }

  showNotification(message, type = 'info') {
    if (window.pwaManager) {
      window.pwaManager.showNotification(message, type);
    } else {
      console.log(message);
    }
  }
}

// Initialiser le comparateur
window.addEventListener('DOMContentLoaded', () => {
  if (!window.pokemonComparator) {
    window.pokemonComparator = new PokemonComparator();
  }
});

// Export pour utilisation dans d'autres modules
window.PokemonComparator = PokemonComparator;
