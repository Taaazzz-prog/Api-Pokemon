/* Commentaire genere pour pablo */
/*
 * Gestionnaire de génération de Pokémons
 * Ce fichier contient la classe GenerationManager qui gère:
 * - Le chargement et l'affichage des Pokémons par génération
 * - La création d'un menu pour naviguer entre les différentes générations
 * - Le filtrage des Pokémons selon leur génération
 */

class GenerationManager {
  // Constructeur initialisant les propriétés et les données des générations
  constructor() {
    // Initialiser le tableau qui contiendra tous les pokémons
    this.pokemons = [];
    
    // Définir les générations avec leurs plages d'ID
    this.generations = [
      { id: 1, name: "Génération 1", range: [1, 151] },
      { id: 2, name: "Génération 2", range: [152, 251] },
      { id: 3, name: "Génération 3", range: [252, 386] },
      { id: 4, name: "Génération 4", range: [387, 493] },
      { id: 5, name: "Génération 5", range: [494, 649] },
      { id: 6, name: "Génération 6", range: [650, 721] },
      { id: 7, name: "Génération 7", range: [722, 809] },
      { id: 8, name: "Génération 8", range: [810, 905] },
      { id: 9, name: "Génération 9", range: [906, 1010] }
    ];
  }

  // Méthode pour récupérer tous les pokémons depuis l'API
  async fetchAllPokemons() {
    try {
      console.log("Récupération des données des pokémons...");
      const response = await fetch('https://pokebuildapi.fr/api/v1/pokemon');
      
      // Vérifier si la requête a réussi
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Stocker les données et afficher des informations de débogage
      this.pokemons = await response.json();
      console.log(`${this.pokemons.length} pokémons récupérés`);
      console.log("Structure de données:", this.pokemons[0]);
      
      // Créer le menu des générations et afficher la première génération
      this.createGenerationMenu();
      this.displayPokemonsByGeneration(1);
    } catch (error) {
      console.error("Erreur lors de la récupération des Pokémon:", error.message);
      
      // Utiliser les données de fallback SEULEMENT pour les erreurs de réseau
      if ((error.message.includes('ERR_INTERNET_DISCONNECTED') || 
           error.message.includes('Failed to fetch') || 
           error.message.includes('Network request failed')) &&
          window.pokemonFallbackData && 
          window.pokemonFallbackData.length > 0) {
        
        console.warn('🔄 Pas de connexion internet - Basculement vers les données de fallback');
        this.pokemons = window.pokemonFallbackData;
        
        // Afficher un message d'information
        this.showOfflineMessage();
        
        // Créer le menu des générations et afficher la première génération
        this.createGenerationMenu();
        this.displayPokemonsByGeneration(1);
      } else {
        // Pour toutes les autres erreurs, afficher un message d'erreur normal
        console.error('Erreur API non liée à la connexion:', error);
        const container = document.getElementById('generation-container');
        container.innerHTML = `<div class="error-message">Impossible de charger les données: ${error.message}</div>`;
      }
    }
  }

  // Méthode pour créer le menu de sélection des générations
  createGenerationMenu() {
    // Récupérer le conteneur du menu
    const menuContainer = document.getElementById('generation-menu');
    menuContainer.innerHTML = '';
    
    // Créer un conteneur pour les boutons
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('generation-buttons');
    
    // Créer un bouton pour chaque génération
    this.generations.forEach(gen => {
      const button = document.createElement('button');
      button.innerText = gen.name;
      button.classList.add('generation-btn');
      button.addEventListener('click', () => this.displayPokemonsByGeneration(gen.id));
      buttonContainer.appendChild(button);
    });
    
    // Ajouter les boutons au conteneur du menu
    menuContainer.appendChild(buttonContainer);
  }

  // Méthode pour afficher les Pokémons d'une génération spécifique
  displayPokemonsByGeneration(genId) {
    // Récupérer le conteneur où afficher les Pokémons
    const container = document.getElementById('generation-container');
    container.innerHTML = '';
    
    // Trouver la génération sélectionnée
    const generation = this.generations.find(gen => gen.id === genId);
    if (!generation) {
      console.error(`Génération ${genId} non trouvée`);
      return;
    }
    
    console.log(`Affichage de la génération ${genId}: ${generation.name}`);
    
    // Créer un titre pour la génération
    const genTitle = document.createElement('h2');
    genTitle.textContent = generation.name;
    container.appendChild(genTitle);
    
    // Créer une grille pour les pokémons
    const pokemonGrid = document.createElement('div');
    pokemonGrid.classList.add('pokemon-grid');
    
    // Filtrer les pokémons appartenant à cette génération
    const genPokemons = this.pokemons.filter(pokemon => 
      pokemon.id >= generation.range[0] && 
      pokemon.id <= generation.range[1]
    );
    
    console.log(`Nombre de pokémons dans cette génération: ${genPokemons.length}`);
    
    // Vérifier si des Pokémons ont été trouvés
    if (genPokemons.length === 0) {
      console.warn("Aucun pokémon trouvé pour cette génération. Vérification du format des données...");
      console.log("Premier pokémon de la liste:", this.pokemons[0]);
    }
    
    // Créer une carte pour chaque Pokémon de la génération
    genPokemons.forEach(pokemon => {
      try {
        // Créer la carte du Pokémon
        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        
        card.dataset.id = pokemon.id;
        card.dataset.name = pokemon.name || '';

        // Gérer l'image du Pokémon
        if (!pokemon.image) {
          console.warn(`Image manquante pour le pokémon ${pokemon.name || pokemon.id}`);
          const image = document.createElement('img');
          image.src = "/image/inconnu.png";
          image.alt = pokemon.name || "Pokémon inconnu";
          card.appendChild(image);
        } else {
          const image = document.createElement('img');
          image.src = pokemon.image;
          image.alt = pokemon.name || "Pokémon";
          image.onerror = function() {
            this.onerror = null;
            this.src = "/image/inconnu.png";
          };
          card.appendChild(image);
        }
        
        // Ajouter le nom du Pokémon
        const name = document.createElement('h3');
        name.textContent = pokemon.name || "Pokémon #" + pokemon.id;
        card.appendChild(name);
        
        // Ajouter l'ID du Pokémon
        const id = document.createElement('p');
        id.textContent = `#${pokemon.id}`;
        card.appendChild(id);
        
        // Ajouter les types du Pokémon
        const typeContainer = document.createElement('div');
        typeContainer.classList.add('pokemon-types');
        
        const typeNames = [];
        if (pokemon.apiTypes && pokemon.apiTypes.length > 0) {
          pokemon.apiTypes.forEach(typeData => {
            const typeSpan = document.createElement('span');
            const rawName = typeData.name || '';
            const baseClass = rawName.toLowerCase();
            const normalizedClass = window.normalizeTypeName ? window.normalizeTypeName(rawName) : baseClass;
            typeSpan.classList.add('pokemon-type');
            if (baseClass) {
              typeSpan.classList.add(`type-${baseClass}`);
            }
            if (normalizedClass && normalizedClass !== baseClass) {
              typeSpan.classList.add(`type-${normalizedClass}`);
            }

            typeSpan.textContent = rawName || "Type";
            typeContainer.appendChild(typeSpan);
            typeNames.push(rawName);
          });
        } else {
          // Si aucun type n'est défini, ajouter "Type inconnu"
          const typeSpan = document.createElement('span');
          typeSpan.classList.add('pokemon-type');
          typeSpan.textContent = "Type inconnu";
          typeContainer.appendChild(typeSpan);
        }

        const normalizedTypes = [];
        typeNames.forEach(name => {
          const base = window.normalizeTypeName ? window.normalizeTypeName(name) : (name || '').toLowerCase();
          const aliases = window.expandTypeAliases ? window.expandTypeAliases(base) : [base];
          aliases.forEach(alias => {
            if (alias) {
              normalizedTypes.push(alias);
            }
          });
        });
        card.dataset.types = typeNames.join(',');
        card.dataset.typesNormalized = Array.from(new Set(normalizedTypes)).join(',');

        // Créer le conteneur des boutons d'action
        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('pokemon-actions');

        // Bouton favoris
        const favoriteBtn = document.createElement('button');
        favoriteBtn.classList.add('favorite-btn');
        favoriteBtn.title = 'Ajouter aux favoris';
        favoriteBtn.setAttribute('aria-label', `Basculer ${pokemon.name} dans les favoris`);
        favoriteBtn.setAttribute('aria-pressed', 'false');
        favoriteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.favoritesManager) {
            window.favoritesManager.toggleFavorite(pokemon);
            const isFav = window.favoritesManager.isFavorite(pokemon.id);
            favoriteBtn.innerHTML = isFav ? '❤️' : '🤍';
            favoriteBtn.setAttribute('aria-pressed', String(isFav));
          }
        });

        // Bouton comparaison
        const compareBtn = document.createElement('button');
        compareBtn.classList.add('compare-btn');
        compareBtn.innerHTML = '⚖️';
        compareBtn.title = 'Comparer ce Pokémon';
        compareBtn.setAttribute('aria-label', `Comparer ${pokemon.name}`);
        compareBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.pokemonComparator) {
            window.pokemonComparator.togglePokemonSelection(pokemon, card);
            const isSelected = window.pokemonComparator.isSelected(pokemon.id);
            compareBtn.innerHTML = isSelected ? '✓' : '⚖️';
            compareBtn.classList.toggle('selected', isSelected);
          }
        });

        const isFavInitial = window.favoritesManager?.isFavorite(pokemon.id) || false;
        favoriteBtn.innerHTML = isFavInitial ? '❤️' : '🤍';
        favoriteBtn.setAttribute('aria-pressed', String(isFavInitial));

        const isSelectedInitial = window.pokemonComparator?.isSelected(pokemon.id) || false;
        compareBtn.innerHTML = isSelectedInitial ? '✓' : '⚖️';
        compareBtn.classList.toggle('selected', isSelectedInitial);

        actionsContainer.appendChild(favoriteBtn);
        actionsContainer.appendChild(compareBtn);
        
        // Ajouter le conteneur de types à la carte
        card.appendChild(typeContainer);
        card.appendChild(actionsContainer);
        pokemonGrid.appendChild(card);
      } catch (e) {
        console.error(`Erreur lors de la création de la carte pour le pokémon ${pokemon.id}:`, e);
      }
    });
    
    // Ajouter la grille au conteneur principal
    container.appendChild(pokemonGrid);
    
    // Afficher un message si aucun Pokémon n'est trouvé
    if (genPokemons.length === 0) {
      const errorMsg = document.createElement('p');
      errorMsg.textContent = "Aucun pokémon trouvé pour cette génération.";
      errorMsg.classList.add('no-pokemon-message');
      container.appendChild(errorMsg);
    }
  }

  // Méthode pour afficher un message hors ligne
  showOfflineMessage() {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'offline-message';
    messageContainer.innerHTML = `
      <div class="offline-banner">
        🔌 Mode Hors Ligne | ${this.pokemons.length} Pokémon disponibles pour les générations
        <button class="retry-btn" onclick="location.reload()">🔄 Réessayer</button>
      </div>
    `;

    // Insérer le message avant le conteneur principal
    const mainContainer = document.getElementById('generation-container');
    if (mainContainer && mainContainer.parentNode) {
      mainContainer.parentNode.insertBefore(messageContainer, mainContainer);
    }
  }
}

// Initialiser le gestionnaire de générations quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const genManager = new GenerationManager();
  genManager.fetchAllPokemons();
});
