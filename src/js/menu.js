/* Commentaire genere pour pablo */
/*
 * Gestionnaire de menu pour la page Pokédex
 * Ce fichier contient la classe MenuManager qui gère:
 * - La création d'un menu de filtrage par types de Pokémon
 * - La création d'une barre de recherche pour filtrer les Pokémons par nom ou id
 * - L'application des filtres sur la liste des Pokémons affichés
 */

class MenuManager {
  // Constructeur initialisant les propriétés et les données des types
  constructor() {
    // Récupérer le conteneur du menu
    this.menuContainer = document.getElementById('menu-container');

    this.menuItems = [];
    this.loadTypesFromAPI()
      .catch(() => this.useFallbackTypes())
      .finally(() => {
        if (this.menuItems.length === 0) {
          this.useFallbackTypes();
        }
        this.createMenuLayout();
      });
  }

  async loadTypesFromAPI() {
    try {
      const response = await fetch('https://pokebuildapi.fr/api/v1/types', { cache: 'force-cache' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Format de types inattendu');
      }

      this.menuItems = data.map(type => ({
        name: type.name,
        logo: type.image,
        normalized: window.normalizeTypeName ? window.normalizeTypeName(type.name) : type.name.toLowerCase(),
        englishName: type.englishName || ''
      })).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    } catch (error) {
      console.warn('Impossible de récupérer les types depuis l\'API, utilisation du fallback.', error);
      throw error;
    }
  }

  useFallbackTypes() {
    const fallback = [
      { name: 'Feu', logo: './logo/Fire.png', englishName: 'fire' },
      { name: 'Eau', logo: './logo/Water.png', englishName: 'water' },
      { name: 'Plante', logo: './logo/Grass.png', englishName: 'grass' },
      { name: 'Électrik', logo: './logo/Electric.png', englishName: 'electric' },
      { name: 'Glace', logo: './logo/Ice.png', englishName: 'ice' },
      { name: 'Roche', logo: './logo/Rock.png', englishName: 'rock' },
      { name: 'Sol', logo: './logo/Ground.png', englishName: 'ground' },
      { name: 'Vol', logo: './logo/Flying.png', englishName: 'flying' },
      { name: 'Insecte', logo: './logo/Bug.png', englishName: 'bug' },
      { name: 'Spectre', logo: './logo/Ghost.png', englishName: 'ghost' },
      { name: 'Acier', logo: './logo/Steel.png', englishName: 'steel' },
      { name: 'Combat', logo: './logo/Fighting.png', englishName: 'fighting' },
      { name: 'Psy', logo: './logo/Psychic.png', englishName: 'psychic' },
      { name: 'Ténèbres', logo: './logo/Dark.png', englishName: 'dark' },
      { name: 'Dragon', logo: './logo/Dragon.png', englishName: 'dragon' },
      { name: 'Fée', logo: './logo/Fairy.png', englishName: 'fairy' },
      { name: 'Poison', logo: './logo/Poison.png', englishName: 'poison' },
      { name: 'Normal', logo: './logo/Normal.png', englishName: 'normal' },
    ];

    this.menuItems = fallback.map(type => ({
      ...type,
      normalized: window.normalizeTypeName ? window.normalizeTypeName(type.name) : type.name.toLowerCase()
    }));
  }

  // Méthode pour créer la structure du menu
  createMenuLayout() {
    // Créer le conteneur pour le menu des types
    this.typeMenuContainer = document.createElement('div');
    this.typeMenuContainer.id = 'type-menu-container';
    this.menuContainer.appendChild(this.typeMenuContainer);
    
    // Créer le conteneur pour la barre de recherche
    this.searchBarContainer = document.createElement('div');
    this.searchBarContainer.id = 'search-bar-container';
    this.menuContainer.appendChild(this.searchBarContainer);
    
    // Créer les éléments du menu
    this.createTypeMenu();
    this.createSearchBar();
  }

  // Méthode pour créer le menu de filtrage par type
  createTypeMenu() {
    // Créer le wrapper pour le menu des types
    const menuWrapper = document.createElement('div');
    menuWrapper.classList.add('type-menu-wrapper');
    
    // Ajouter un bouton "Tous" pour afficher tous les Pokémon
    const allButton = document.createElement('div');
    allButton.classList.add('menu-item');
    allButton.dataset.typeNormalized = '';
    allButton.innerHTML = '<span>Tous</span>';
    allButton.addEventListener('click', () => {
      // Afficher toutes les cartes Pokémon
      document.querySelectorAll('.pokemon-card').forEach(card => {
        card.style.display = '';
      });
      this.highlightActiveType(allButton);
    });
    menuWrapper.appendChild(allButton);

    // Ajouter un bouton pour chaque type de Pokémon
    this.menuItems.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.classList.add('menu-item');

      const normalized = item.normalized || (window.normalizeTypeName ? window.normalizeTypeName(item.name) : item.name.toLowerCase());
      const aliases = window.expandTypeAliases ? window.expandTypeAliases(normalized) : [normalized];
      menuItem.dataset.typeNormalized = normalized;
      menuItem.dataset.typeAliases = aliases.join(',');

      // Créer l'image du type
      const img = document.createElement('img');
      img.src = item.logo;
      img.alt = item.name;
      img.onerror = function() {
        this.style.display = 'none';
      };

      // Créer le texte du type
      const span = document.createElement('span');
      span.textContent = item.name;

      // Assembler l'élément du menu
      menuItem.appendChild(img);
      menuItem.appendChild(span);
      menuWrapper.appendChild(menuItem);

      // Ajouter l'événement de filtrage par type
      menuItem.addEventListener('click', () => {
        const pokemonCards = document.querySelectorAll('.pokemon-card');
        const aliasesAttr = menuItem.dataset.typeAliases || '';
        const typeAliases = aliasesAttr ? aliasesAttr.split(',').map(alias => alias.trim()).filter(Boolean) : [menuItem.dataset.typeNormalized];

        pokemonCards.forEach(card => {
          const normalizedList = card.dataset.typesNormalized || '';
          const rawList = card.dataset.types || '';
          const types = (normalizedList ? normalizedList.split(',') : rawList.toLowerCase().split(','))
            .map(type => type.trim())
            .filter(Boolean);
          const typeSet = new Set(types);
          const shouldShow = typeAliases.some(alias => typeSet.has(alias));
          card.style.display = shouldShow ? '' : 'none';
        });
        this.highlightActiveType(menuItem);
      });
    });

    // Ajouter le menu des types au conteneur
    this.typeMenuContainer.appendChild(menuWrapper);

    this.highlightActiveType(allButton);
  }

  // Méthode pour créer la barre de recherche
  createSearchBar() {
    // Créer le conteneur de la barre de recherche
    const searchContainer = document.createElement('div');
    searchContainer.classList.add('search-container');
    
    // Créer l'input de recherche
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'search-pokemon';
    searchInput.placeholder = 'Rechercher un Pokémon...';
    searchInput.classList.add('search-input');
    
    // Ajouter l'événement de recherche sur la saisie
    searchInput.addEventListener('input', () => {
      this.filterPokemon(searchInput.value);
      
      // Déclencher l'événement pour l'historique si la recherche n'est pas vide
      if (searchInput.value.trim()) {
        const searchEvent = new CustomEvent('pokemonSearch', {
          detail: {
            query: searchInput.value.trim(),
            type: 'recherche simple',
            timestamp: new Date().toISOString()
          }
        });
        document.dispatchEvent(searchEvent);
      }
    });
    
    // Assembler la barre de recherche
    searchContainer.appendChild(searchInput);
    this.searchBarContainer.appendChild(searchContainer);
  }

  // Méthode pour filtrer les Pokémons en fonction du terme de recherche
  filterPokemon(searchTerm) {
    const pokemonCards = document.querySelectorAll('.pokemon-card');
    searchTerm = searchTerm.toLowerCase();
    
    // Parcourir toutes les cartes et filtrer par nom ou ID
    pokemonCards.forEach(card => {
      const pokemonName = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const pokemonId = card.querySelector('p')?.textContent.toLowerCase() || '';
      
      // Afficher ou masquer les cartes selon la recherche
      if (pokemonName.includes(searchTerm) || pokemonId.includes(searchTerm)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  highlightActiveType(activeItem) {
    const menuItems = this.menuContainer.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }
}

// Initialiser le gestionnaire de menu quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const menuManager = new MenuManager();
});
