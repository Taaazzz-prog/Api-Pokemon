/*
 * Gestionnaire de recherche avancée pour les Pokémon
 * Ce fichier gère la recherche avec filtres combinés
 */

class AdvancedSearchManager {
  constructor() {
    this.pokemonData = [];
    this.filteredResults = [];
    this.isAdvancedMode = false;
    this.createAdvancedSearchInterface();
  }

  // Initialiser avec les données Pokémon
  init(pokemonData) {
    this.pokemonData = pokemonData;
    this.filteredResults = [...pokemonData];
  }

  // Créer l'interface de recherche avancée
  createAdvancedSearchInterface() {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return;

    // Créer le conteneur de recherche avancée
    const advancedContainer = document.createElement('div');
    advancedContainer.classList.add('advanced-search-container');

    advancedContainer.innerHTML = `
      <div class="search-mode-toggle">
        <button id="toggle-search-mode" class="toggle-btn">
          🔍 Filtres avancés
        </button>
      </div>
      
      <div class="advanced-filters">
        <div class="filter-group">
          <label for="name-filter">Nom :</label>
          <input type="text" id="name-filter" placeholder="Pikachu, Charizard...">
        </div>
        
        <div class="filter-group">
          <label for="id-range">ID (range) :</label>
          <div class="range-inputs">
            <input type="number" id="id-min" placeholder="Min" min="1" max="1010">
            <span>-</span>
            <input type="number" id="id-max" placeholder="Max" min="1" max="1010">
          </div>
        </div>
        
        <div class="filter-group">
          <label for="type-filter">Type :</label>
          <select id="type-filter">
            <option value="">Tous les types</option>
            <option value="Feu">Feu</option>
            <option value="Eau">Eau</option>
            <option value="Plante">Plante</option>
            <option value="Électrik">Électrik</option>
            <option value="Glace">Glace</option>
            <option value="Combat">Combat</option>
            <option value="Poison">Poison</option>
            <option value="Sol">Sol</option>
            <option value="Vol">Vol</option>
            <option value="Psy">Psy</option>
            <option value="Insecte">Insecte</option>
            <option value="Roche">Roche</option>
            <option value="Spectre">Spectre</option>
            <option value="Dragon">Dragon</option>
            <option value="Ténèbres">Ténèbres</option>
            <option value="Acier">Acier</option>
            <option value="Fée">Fée</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="generation-filter">Génération :</label>
          <select id="generation-filter">
            <option value="">Toutes les générations</option>
            <option value="1">Génération 1 (1-151)</option>
            <option value="2">Génération 2 (152-251)</option>
            <option value="3">Génération 3 (252-386)</option>
            <option value="4">Génération 4 (387-493)</option>
            <option value="5">Génération 5 (494-649)</option>
            <option value="6">Génération 6 (650-721)</option>
            <option value="7">Génération 7 (722-809)</option>
            <option value="8">Génération 8 (810-905)</option>
            <option value="9">Génération 9 (906-1010)</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="stat-filter">Stats :</label>
          <select id="stat-filter">
            <option value="">Filtrer par stat</option>
            <option value="hp">PV</option>
            <option value="attack">Attaque</option>
            <option value="defense">Défense</option>
            <option value="special_attack">Attaque Spé</option>
            <option value="special_defense">Défense Spé</option>
            <option value="speed">Vitesse</option>
          </select>
          <div class="stat-range" style="display: none;">
            <input type="number" id="stat-min" placeholder="Min">
            <span>-</span>
            <input type="number" id="stat-max" placeholder="Max">
          </div>
        </div>
        
        <div class="filter-actions">
          <button id="apply-filters" class="apply-btn">🔍 Appliquer</button>
          <button id="clear-filters" class="clear-btn">🗑️ Effacer</button>
          <button id="save-search" class="save-btn">💾 Sauvegarder</button>
        </div>
        
        <div class="search-results-info">
          <span id="results-count">0 résultats</span>
        </div>
      </div>
    `;

    advancedContainer.style.display = 'block';
    const advancedFiltersEl = advancedContainer.querySelector('.advanced-filters');
    if (advancedFiltersEl) {
      advancedFiltersEl.style.display = 'none';
    }

    const attachContainer = () => {
      const typeContainer = menuContainer.querySelector('#type-menu-container');
      if (typeContainer && typeContainer.parentNode) {
        typeContainer.parentNode.insertBefore(advancedContainer, typeContainer.nextSibling);
        return;
      }
      if (!advancedContainer.parentNode) {
        menuContainer.appendChild(advancedContainer);
      }
      setTimeout(attachContainer, 120);
    };
    attachContainer();

    this.setupAdvancedSearchEvents();
    this.loadSavedSearches();
  }

  // Configurer les événements de recherche avancée
  setupAdvancedSearchEvents() {
    const toggleBtn = document.getElementById('toggle-search-mode');
    const advancedFilters = document.querySelector('.advanced-filters');
    const statFilter = document.getElementById('stat-filter');
    const statRange = document.querySelector('.stat-range');

    // Toggle mode avancé
    toggleBtn?.addEventListener('click', () => {
      this.isAdvancedMode = !this.isAdvancedMode;
      advancedFilters.style.display = this.isAdvancedMode ? 'block' : 'none';
      toggleBtn.textContent = this.isAdvancedMode ? 
        '🔍 Masquer les filtres' : '🔍 Filtres avancés';
      
      if (!this.isAdvancedMode) {
        this.clearAllFilters();
      }
    });

    // Afficher/masquer la plage de stats
    statFilter?.addEventListener('change', () => {
      statRange.style.display = statFilter.value ? 'flex' : 'none';
    });

    // Appliquer les filtres
    document.getElementById('apply-filters')?.addEventListener('click', () => {
      this.applyAdvancedFilters();
    });

    // Effacer les filtres
    document.getElementById('clear-filters')?.addEventListener('click', () => {
      this.clearAllFilters();
    });

    // Sauvegarder la recherche
    document.getElementById('save-search')?.addEventListener('click', () => {
      this.saveCurrentSearch();
    });

    // Recherche en temps réel sur le nom
    document.getElementById('name-filter')?.addEventListener('input', () => {
      if (this.isAdvancedMode) {
        this.applyAdvancedFilters();
      }
    });
  }

  // Appliquer les filtres avancés
  applyAdvancedFilters() {
    if (!this.pokemonData.length) return;

    let filtered = [...this.pokemonData];

    // Filtrer par nom
    const nameFilter = document.getElementById('name-filter')?.value.trim().toLowerCase();
    if (nameFilter) {
      filtered = filtered.filter(pokemon => 
        pokemon.name.toLowerCase().includes(nameFilter)
      );
    }

    // Filtrer par ID
    const idMin = parseInt(document.getElementById('id-min')?.value) || 1;
    const idMax = parseInt(document.getElementById('id-max')?.value) || 1010;
    filtered = filtered.filter(pokemon => 
      pokemon.id >= idMin && pokemon.id <= idMax
    );

    // Filtrer par type
    const typeFilter = document.getElementById('type-filter')?.value;
    if (typeFilter) {
    const normalizedType = window.normalizeTypeName ? window.normalizeTypeName(typeFilter) : typeFilter.toLowerCase();
    const aliases = window.expandTypeAliases ? window.expandTypeAliases(normalizedType) : [normalizedType];
    filtered = filtered.filter(pokemon => {
      const types = (pokemon.apiTypes || []).flatMap(type => {
        const typeName = type?.name || type;
        const base = window.normalizeTypeName ? window.normalizeTypeName(typeName) : (typeName || '').toLowerCase();
        return window.expandTypeAliases ? window.expandTypeAliases(base) : [base];
      });
      const normalizedSet = new Set(types);
      return aliases.some(alias => normalizedSet.has(alias));
    });
    }

    // Filtrer par génération
    const generationFilter = document.getElementById('generation-filter')?.value;
    if (generationFilter) {
      const genRanges = {
        '1': [1, 151], '2': [152, 251], '3': [252, 386],
        '4': [387, 493], '5': [494, 649], '6': [650, 721],
        '7': [722, 809], '8': [810, 905], '9': [906, 1010]
      };
      const [min, max] = genRanges[generationFilter];
      filtered = filtered.filter(pokemon => 
        pokemon.id >= min && pokemon.id <= max
      );
    }

    // Filtrer par stats
    const statFilter = document.getElementById('stat-filter')?.value;
    if (statFilter) {
      const statMin = parseInt(document.getElementById('stat-min')?.value) || 0;
      const statMax = parseInt(document.getElementById('stat-max')?.value) || 999;
      
      filtered = filtered.filter(pokemon => {
        const statValue = pokemon.stats?.[statFilter] || 0;
        return statValue >= statMin && statValue <= statMax;
      });
    }

    this.filteredResults = filtered;
    this.updateResultsDisplay();
    this.updateResultsCount();

    // Déclencher l'événement pour l'historique de recherche
    this.dispatchSearchEvent({
      query: nameFilter || '',
      type: typeFilter || 'tous',
      generation: generationFilter || 'toutes',
      results: filtered.length,
      timestamp: new Date().toISOString()
    });
  }

  // Mettre à jour l'affichage des résultats
  updateResultsDisplay() {
    // Mettre à jour la pagination avec les résultats filtrés
    if (window.paginationManager) {
      window.paginationManager.updateWithFilteredItems(this.filteredResults);
    } else {
      // Fallback si pas de pagination
      this.displayFilteredResults();
    }
  }

  // Afficher les résultats filtrés (fallback)
  displayFilteredResults() {
    const container = document.getElementById('pokemon-container');
    if (!container || !window.pokemonManager) return;

    window.pokemonManager.displayPokemonPage(this.filteredResults);
  }

  // Mettre à jour le compteur de résultats
  updateResultsCount() {
    const counter = document.getElementById('results-count');
    if (counter) {
      counter.textContent = `${this.filteredResults.length} résultat${this.filteredResults.length > 1 ? 's' : ''}`;
    }
  }

  // Effacer tous les filtres
  clearAllFilters() {
    document.getElementById('name-filter').value = '';
    document.getElementById('id-min').value = '';
    document.getElementById('id-max').value = '';
    document.getElementById('type-filter').value = '';
    document.getElementById('generation-filter').value = '';
    document.getElementById('stat-filter').value = '';
    document.getElementById('stat-min').value = '';
    document.getElementById('stat-max').value = '';
    
    document.querySelector('.stat-range').style.display = 'none';
    
    this.filteredResults = [...this.pokemonData];
    this.updateResultsDisplay();
    this.updateResultsCount();
  }

  // Sauvegarder la recherche actuelle
  saveCurrentSearch() {
    const searchName = prompt('Nom de la recherche sauvegardée :');
    if (!searchName) return;

    const searchParams = {
      name: searchName,
      filters: {
        nameFilter: document.getElementById('name-filter')?.value || '',
        idMin: document.getElementById('id-min')?.value || '',
        idMax: document.getElementById('id-max')?.value || '',
        typeFilter: document.getElementById('type-filter')?.value || '',
        generationFilter: document.getElementById('generation-filter')?.value || '',
        statFilter: document.getElementById('stat-filter')?.value || '',
        statMin: document.getElementById('stat-min')?.value || '',
        statMax: document.getElementById('stat-max')?.value || ''
      },
      savedAt: new Date().toISOString()
    };

    let savedSearches = JSON.parse(localStorage.getItem('pokemon-saved-searches') || '[]');
    savedSearches.push(searchParams);
    localStorage.setItem('pokemon-saved-searches', JSON.stringify(savedSearches));

    if (window.favoritesManager) {
      window.favoritesManager.showNotification(`Recherche "${searchName}" sauvegardée ! 💾`);
    }
  }

  // Charger les recherches sauvegardées
  loadSavedSearches() {
    const savedSearches = JSON.parse(localStorage.getItem('pokemon-saved-searches') || '[]');
    // TODO: Ajouter une interface pour charger les recherches sauvegardées
  }

  // Obtenir les résultats actuels
  getCurrentResults() {
    return this.filteredResults;
  }

  // Déclencher l'événement de recherche pour l'historique
  dispatchSearchEvent(searchData) {
    const event = new CustomEvent('pokemonSearch', {
      detail: searchData
    });
    document.dispatchEvent(event);
  }
}

// Initialiser la recherche avancée
document.addEventListener('DOMContentLoaded', () => {
  window.advancedSearchManager = new AdvancedSearchManager();
});
