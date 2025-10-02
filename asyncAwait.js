/* Commentaire genere pour pablo */
/*
 * Gestionnaire principal des Pokémons pour la page Pokédex
 * Ce fichier contient la classe Po        // Assembler tous les éléments dans la carte
        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(id);
        card.appendChild(typeContainer);
        
        // Ajouter la carte au conteneur principal
        this.pokemonContainer.appendChild(card);

        // Mettre à jour les boutons de favoris si le gestionnaire existe
        if (window.favoritesManager) {
          setTimeout(() => {
            window.favoritesManager.updateFavoriteButtons();
          }, 100);
        }ager qui gère:
 * - Le chargement des données des Pokémons depuis l'API
 * - L'affichage des cartes Pokémons dans la grille
 * - La gestion des détails de chaque Pokémon dans une popup
 */

class PokemonManager {
  // Constructeur initialisant les propriétés et les événements de fermeture du popup
  constructor() {
    // Initialiser les propriétés principales
    this.pokemons = [];
    this.displayedPokemons = []; // Pokémons actuellement affichés
    this.pokemonContainer = document.getElementById('pokemon-container');
    this.popup = document.getElementById('popup');
    this.popupContent = document.getElementById('popup-content');
    this.closePopupBtn = document.getElementById('close-popup');
    
    // Configurer l'événement de fermeture du popup par le bouton
    this.closePopupBtn.addEventListener('click', () => this.closePopup());
    
    // Configurer la fermeture du popup en cliquant en dehors
    window.addEventListener('click', (event) => {
      if (event.target === this.popup) {
        this.closePopup();
      }
    });

    // Écouter les événements de pagination
    document.addEventListener('paginationUpdate', (event) => {
      this.displayPokemonPage(event.detail.items);
    });

    // Écouter les changements de favoris pour mettre à jour l'affichage
    document.addEventListener('favoritesUpdated', () => {
      if (window.favoritesManager) {
        window.favoritesManager.updateFavoriteButtons();
      }
    });
  }

  // Méthode asynchrone pour récupérer les données des Pokémons depuis l'API
  async fetchPokemons() {
    try {
      console.log("Récupération des données de tous les Pokémon...");
      
      // Afficher l'indicateur de chargement
      showLoading('pokemon-container');
      
      const response = await fetch('https://pokebuildapi.fr/api/v1/pokemon');
      
      // Vérifier si la requête a réussi
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Convertir la réponse en JSON et l'assigner à la propriété pokemons
      this.pokemons = await response.json();
      console.log(`${this.pokemons.length} Pokémon récupérés depuis l'API`);
      console.log("Structure d'un Pokémon:", this.pokemons[0]);
      
      // Masquer l'indicateur de chargement
      hideLoading('pokemon-container');
      
      // Initialiser la pagination avec tous les Pokémons
      if (window.paginationManager) {
        window.paginationManager.init(this.pokemons);
      } else {
        // Fallback sans pagination
        this.displayPokemons();
      }

      // Initialiser la recherche avancée avec les données
      if (window.advancedSearchManager) {
        window.advancedSearchManager.init(this.pokemons);
      }
    } catch (error) {
      console.error("Erreur API détectée:", error.message);
      
      // Utiliser les données de fallback SEULEMENT pour les erreurs de réseau
      if ((error.message.includes('ERR_INTERNET_DISCONNECTED') || 
           error.message.includes('Failed to fetch') || 
           error.message.includes('Network request failed')) &&
          window.pokemonFallbackData && 
          window.pokemonFallbackData.length > 0) {
        
        console.warn("🔄 Pas de connexion internet - Basculement vers les données de fallback");
        this.pokemons = window.pokemonFallbackData;
        
        // Masquer l'indicateur de chargement
        hideLoading('pokemon-container');
        
        // Afficher un message d'information
        this.showOfflineMessage();
        
        // Initialiser avec les données de fallback
        if (window.paginationManager) {
          window.paginationManager.init(this.pokemons);
        } else {
          this.displayPokemons();
        }

        if (window.advancedSearchManager) {
          window.advancedSearchManager.init(this.pokemons);
        }
      } else {
        // Pour toutes les autres erreurs, utiliser la gestion d'erreur normale
        console.error("Erreur API non liée à la connexion:", error);
        handleApiError(error, 'pokemon-container');
      }
    }
  }

  // Méthode pour afficher tous les Pokémons dans la grille
  displayPokemons() {
    this.displayPokemonPage(this.pokemons);
  }

  // Méthode pour afficher une page spécifique de Pokémons
  displayPokemonPage(pokemonsToDisplay) {
    // Vider le conteneur
    this.pokemonContainer.innerHTML = '';
    this.displayedPokemons = pokemonsToDisplay;
    
    // Parcourir les Pokémons de la page et créer une carte pour chacun
    pokemonsToDisplay.forEach(pokemon => {
      try {
        // Créer la carte du Pokémon
        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        card.dataset.id = pokemon.id;

        // Stocker les types du Pokémon pour le filtrage
        const pokemonTypes = (pokemon.apiTypes || []).map(type => type.name || type);
        const normalizedTypes = [];
        pokemonTypes.forEach(name => {
          const base = window.normalizeTypeName ? window.normalizeTypeName(name) : (name || '').toLowerCase();
          const aliases = window.expandTypeAliases ? window.expandTypeAliases(base) : [base];
          aliases.forEach(alias => {
            if (alias) {
              normalizedTypes.push(alias);
            }
          });
        });
        card.dataset.types = pokemonTypes.join(',');
        card.dataset.typesNormalized = Array.from(new Set(normalizedTypes)).join(',');
        card.dataset.name = pokemon.name;
        
        // Ajouter l'événement pour afficher les détails
        card.addEventListener('click', () => this.openPokemonDetails(pokemon.id));
        
        // Créer l'élément image avec lazy loading
        const imageSrc = pokemon.image || pokemon.sprite || (pokemon.images && (pokemon.images.regular || pokemon.images.icon)) || './image/inconnu.png';
        const image = window.lazyLoadManager ?
          window.lazyLoadManager.createLazyImage(imageSrc, pokemon.name, 'pokemon-image') :
          this.createRegularImage(imageSrc, pokemon.name);
        
        // Ajouter le nom du Pokémon
        const name = document.createElement('h3');
        name.textContent = pokemon.name;
        
        // Ajouter l'ID du Pokémon
        const id = document.createElement('p');
        id.textContent = `#${pokemon.id}`;
        
        // Créer le conteneur pour les types
        const typeContainer = document.createElement('div');
        typeContainer.classList.add('pokemon-types');
        
        // Création des badges de type
        if (pokemon.apiTypes && pokemon.apiTypes.length > 0) {
          pokemon.apiTypes.forEach(typeData => {
            const typeSpan = document.createElement('span');
            const rawTypeName = typeData.name || '';
            const typeClassBase = rawTypeName ? rawTypeName.toLowerCase() : '';
            const normalizedClass = window.normalizeTypeName ? window.normalizeTypeName(rawTypeName) : typeClassBase;
            typeSpan.classList.add('pokemon-type');
            if (typeClassBase) {
              typeSpan.classList.add(`type-${typeClassBase}`);
            }
            if (normalizedClass && normalizedClass !== typeClassBase) {
              typeSpan.classList.add(`type-${normalizedClass}`);
            }
            typeSpan.textContent = rawTypeName;
            typeContainer.appendChild(typeSpan);
          });
        }

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
          e.stopPropagation(); // Empêcher l'ouverture des détails
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
          e.stopPropagation(); // Empêcher l'ouverture des détails
          if (window.pokemonComparator) {
            window.pokemonComparator.togglePokemonSelection(pokemon, card);
            const isSelected = window.pokemonComparator.selectedPokemons?.has(pokemon.id);
            compareBtn.innerHTML = isSelected ? '✓' : '⚖️';
            compareBtn.classList.toggle('selected', isSelected);
          }
        });

        const isFav = window.favoritesManager?.isFavorite(pokemon.id) || false;
        favoriteBtn.innerHTML = isFav ? '❤️' : '🤍';
        favoriteBtn.setAttribute('aria-pressed', String(isFav));

        const isSelected = window.pokemonComparator?.selectedPokemons?.has(pokemon.id) || false;
        compareBtn.innerHTML = isSelected ? '✓' : '⚖️';
        compareBtn.classList.toggle('selected', isSelected);

        actionsContainer.appendChild(favoriteBtn);
        actionsContainer.appendChild(compareBtn);
        
        // Assembler tous les éléments de la carte
        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(id);
        card.appendChild(typeContainer);
        card.appendChild(actionsContainer);
        
        // Ajouter la carte au conteneur principal
        this.pokemonContainer.appendChild(card);
      } catch (e) {
        console.error(`Erreur lors de la création de la carte pour le Pokémon ${pokemon.id}:`, e);
      }
    });
  }

  // Méthode pour ouvrir une popup avec les détails d'un Pokémon
  async openPokemonDetails(pokemonId) {
    try {
      // Trouver le Pokémon par son ID
      const pokemon = this.pokemons.find(p => p.id === pokemonId);
      if (!pokemon) throw new Error(`Pokémon non trouvé avec l'ID ${pokemonId}`);
      
      console.log("Affichage des détails pour:", pokemon);
      
      // Vider le contenu actuel de la popup
      this.popupContent.innerHTML = '';
      
      // Créer le conteneur principal des détails
      const detailsContainer = document.createElement('div');
      detailsContainer.classList.add('pokemon-details');
      
      // === SECTION 1: EN-TÊTE AVEC IMAGE ET INFORMATIONS DE BASE ===
      const header = document.createElement('div');
      header.classList.add('pokemon-details-header');
      
      // Image du Pokémon
      const image = document.createElement('img');
      image.src = pokemon.image;
      image.alt = pokemon.name;
      image.onerror = function() {
        this.onerror = null;
        this.src = "/image/inconnu.png";
      };
      
      // Informations de base (nom, ID)
      const basicInfo = document.createElement('div');
      basicInfo.classList.add('pokemon-basic-info');
      
      const name = document.createElement('h2');
      name.textContent = pokemon.name;
      
      const id = document.createElement('p');
      id.classList.add('pokemon-id');
      id.textContent = `#${pokemon.pokedexId || pokemon.id}`;
      
      basicInfo.appendChild(name);
      basicInfo.appendChild(id);
      
      // Informations générales (génération, types)
      const generalInfo = document.createElement('div');
      generalInfo.classList.add('pokemon-general-info');
      
      // Ajouter la génération si disponible
      if (pokemon.apiGeneration) {
        const generation = document.createElement('p');
        generation.innerHTML = `<strong>Génération:</strong> ${pokemon.apiGeneration}`;
        generalInfo.appendChild(generation);
      }
      
      // Conteneur pour les types
      const typesContainer = document.createElement('div');
      typesContainer.classList.add('pokemon-types', 'detail-types');
      
      const typesLabel = document.createElement('p');
      typesLabel.innerHTML = '<strong>Types:</strong>';
      typesContainer.appendChild(typesLabel);
      
      const typesList = document.createElement('div');
      typesList.classList.add('types-container');
      
      // Ajouter chaque type du Pokémon
      if (pokemon.apiTypes && pokemon.apiTypes.length > 0) {
        pokemon.apiTypes.forEach(typeData => {
          const typeSpan = document.createElement('span');
          const typeName = typeData.name ? typeData.name.toLowerCase() : '';
          typeSpan.classList.add('pokemon-type', `type-${typeName}`);  // La même classe CSS est utilisée
          typeSpan.textContent = typeData.name;
          typesList.appendChild(typeSpan);
        });
      }
      
      // Assembler les éléments d'en-tête
      typesContainer.appendChild(typesList);
      generalInfo.appendChild(typesContainer);
      basicInfo.appendChild(generalInfo);
      header.appendChild(image);
      header.appendChild(basicInfo);
      detailsContainer.appendChild(header);
      
      // === SECTION 2: STATISTIQUES ===
      const statsSection = document.createElement('div');
      statsSection.classList.add('pokemon-stats');
      
      const statsTitle = document.createElement('h3');
      statsTitle.textContent = 'Statistiques';
      statsSection.appendChild(statsTitle);
      
      const statsList = document.createElement('ul');
      
      // Créer une barre de statistique pour chaque attribut
      if (pokemon.stats) {
        const stats = [
          { name: 'PV', value: pokemon.stats.HP },
          { name: 'Attaque', value: pokemon.stats.attack },
          { name: 'Défense', value: pokemon.stats.defense },
          { name: 'Attaque Spé.', value: pokemon.stats.special_attack },
          { name: 'Défense Spé.', value: pokemon.stats.special_defense },
          { name: 'Vitesse', value: pokemon.stats.speed }
        ];
        
        // Créer un élément pour chaque statistique
        stats.forEach(stat => {
          const statItem = document.createElement('li');
          statItem.innerHTML = `<span class="stat-name">${stat.name}:</span> <span class="stat-value">${stat.value}</span>
                               <div class="stat-bar"><div class="stat-fill" style="width: ${stat.value / 2}%;"></div></div>`;
          statsList.appendChild(statItem);
        });
      }
      
      statsSection.appendChild(statsList);
      detailsContainer.appendChild(statsSection);
      
      // === SECTION 3: RÉSISTANCES ET FAIBLESSES ===
      if (pokemon.apiResistances && pokemon.apiResistances.length > 0) {
        const resistancesSection = document.createElement('div');
        resistancesSection.classList.add('pokemon-resistances-weaknesses');
        
        const resistancesTitle = document.createElement('h3');
        resistancesTitle.textContent = 'Résistances & Faiblesses';
        resistancesSection.appendChild(resistancesTitle);
        
        const resistancesContainer = document.createElement('div');
        resistancesContainer.classList.add('resistances-weaknesses-container');
        
        // Conteneur pour les résistances
        const resistances = document.createElement('div');
        resistances.classList.add('resistances');
        const resistancesLabel = document.createElement('h4');
        resistancesLabel.textContent = 'Résistances:';
        resistances.appendChild(resistancesLabel);
        
        const resistancesList = document.createElement('div');
        resistancesList.classList.add('type-list');
        
        // Conteneur pour les faiblesses
        const weaknesses = document.createElement('div');
        weaknesses.classList.add('weaknesses');
        const weaknessesLabel = document.createElement('h4');
        weaknessesLabel.textContent = 'Faiblesses:';
        weaknesses.appendChild(weaknessesLabel);
        
        const weaknessesList = document.createElement('div');
        weaknessesList.classList.add('type-list');
        
        // Conteneur pour les types neutres
        const neutral = document.createElement('div');
        neutral.classList.add('neutral');
        const neutralLabel = document.createElement('h4');
        neutralLabel.textContent = 'Neutre:';
        neutral.appendChild(neutralLabel);
        
        const neutralList = document.createElement('div');
        neutralList.classList.add('type-list');
        
        // Classer chaque relation de type dans la catégorie appropriée
        pokemon.apiResistances.forEach(resistance => {
          const relationItem = document.createElement('div');
          
          // Créer l'icône du type
          const typeSpan = document.createElement('span');
          typeSpan.classList.add('pokemon-type', `type-${resistance.name.toLowerCase()}`);  // Même approche
          typeSpan.textContent = resistance.name;
          
          // Afficher le multiplicateur de dégâts
          const multiplier = document.createElement('span');
          multiplier.classList.add('multiplier');
          multiplier.textContent = `x${resistance.damage_multiplier}`;
          
          relationItem.appendChild(typeSpan);
          relationItem.appendChild(multiplier);
          
          // Classer selon la relation de dégâts
          if (resistance.damage_relation === "resistant" || resistance.damage_relation === "twice_resistant") {
            relationItem.classList.add('resistance-item');
            resistancesList.appendChild(relationItem);
          } 
          else if (resistance.damage_relation === "vulnerable") {
            relationItem.classList.add('weakness-item');
            weaknessesList.appendChild(relationItem);
          }
          else {
            relationItem.classList.add('neutral-item');
            neutralList.appendChild(relationItem);
          }
        });
        
        // Ajouter les listes seulement si elles contiennent des éléments
        if (resistancesList.children.length > 0) {
          resistances.appendChild(resistancesList);
          resistancesContainer.appendChild(resistances);
        }
        
        if (weaknessesList.children.length > 0) {
          weaknesses.appendChild(weaknessesList);
          resistancesContainer.appendChild(weaknesses);
        }
        
        if (neutralList.children.length > 0) {
          neutral.appendChild(neutralList);
          resistancesContainer.appendChild(neutral);
        }
        
        resistancesSection.appendChild(resistancesContainer);
        detailsContainer.appendChild(resistancesSection);
      }
      
      // === SECTION 4: ÉVOLUTIONS ===
      if (pokemon.apiEvolutions && pokemon.apiEvolutions.length > 0 || pokemon.apiPreEvolution !== "none") {
        const evoSection = document.createElement('div');
        evoSection.classList.add('pokemon-evolution');
        
        const evoTitle = document.createElement('h3');
        evoTitle.textContent = 'Évolutions';
        evoSection.appendChild(evoTitle);
        
        const evoChain = document.createElement('div');
        evoChain.classList.add('evolution-chain');
        
        // Ajouter la pré-évolution si elle existe
        if (pokemon.apiPreEvolution !== "none") {
          const preEvolutionName = pokemon.apiPreEvolution;
          const preEvolution = this.pokemons.find(p => p.name === preEvolutionName);
          
          if (preEvolution) {
            // Créer l'élément de pré-évolution
            const preEvoElement = document.createElement('div');
            preEvoElement.classList.add('evolution-item');
            
            // Image de la pré-évolution
            const preEvoImg = document.createElement('img');
            preEvoImg.src = preEvolution.image;
            preEvoImg.alt = preEvolution.name;
            preEvoImg.onerror = function() {
              this.onerror = null;
              this.src = "/image/inconnu.png";
            };
            
            // Nom et numéro de la pré-évolution
            const preEvoName = document.createElement('p');
            preEvoName.textContent = preEvolution.name;
            
            const preEvoNum = document.createElement('small');
            preEvoNum.textContent = `#${preEvolution.pokedexId || preEvolution.id}`;
            
            // Assembler l'élément de pré-évolution
            preEvoElement.appendChild(preEvoImg);
            preEvoElement.appendChild(preEvoName);
            preEvoElement.appendChild(preEvoNum);
            
            // Ajouter un gestionnaire d'événement pour naviguer vers la pré-évolution
            preEvoElement.addEventListener('click', () => this.openPokemonDetails(preEvolution.id));
            
            evoChain.appendChild(preEvoElement);
            
            // Ajouter une flèche
            const arrow = document.createElement('div');
            arrow.classList.add('evolution-arrow');
            arrow.textContent = '→';
            evoChain.appendChild(arrow);
          }
        }
        
        // Ajouter le Pokémon actuel dans la chaîne d'évolution
        const currentEvo = document.createElement('div');
        currentEvo.classList.add('evolution-item', 'current-evolution');
        
        const currentEvoImg = document.createElement('img');
        currentEvoImg.src = pokemon.image;
        currentEvoImg.alt = pokemon.name;
        
        const currentEvoName = document.createElement('p');
        currentEvoName.textContent = pokemon.name;
        
        const currentEvoNum = document.createElement('small');
        currentEvoNum.textContent = `#${pokemon.pokedexId || pokemon.id}`;
        
        currentEvo.appendChild(currentEvoImg);
        currentEvo.appendChild(currentEvoName);
        currentEvo.appendChild(currentEvoNum);
        evoChain.appendChild(currentEvo);
        
        // Ajouter les évolutions suivantes si elles existent
        if (pokemon.apiEvolutions && pokemon.apiEvolutions.length > 0) {
          // Ajouter une flèche vers l'évolution
          const arrow = document.createElement('div');
          arrow.classList.add('evolution-arrow');
          arrow.textContent = '→';
          evoChain.appendChild(arrow);
          
          // Parcourir chaque évolution
          pokemon.apiEvolutions.forEach(evolution => {
            const nextEvolution = this.pokemons.find(p => p.name === evolution.name);
            
            if (nextEvolution) {
              // Créer l'élément d'évolution
              const nextEvoElement = document.createElement('div');
              nextEvoElement.classList.add('evolution-item');
              
              // Image de l'évolution
              const nextEvoImg = document.createElement('img');
              nextEvoImg.src = nextEvolution.image;
              nextEvoImg.alt = nextEvolution.name;
              nextEvoImg.onerror = function() {
                this.onerror = null;
                this.src = "/image/inconnu.png";
              };
              
              // Nom et numéro de l'évolution
              const nextEvoName = document.createElement('p');
              nextEvoName.textContent = nextEvolution.name;
              
              const nextEvoNum = document.createElement('small');
              nextEvoNum.textContent = `#${evolution.pokedexId || nextEvolution.id}`;
              
              // Assembler l'élément d'évolution
              nextEvoElement.appendChild(nextEvoImg);
              nextEvoElement.appendChild(nextEvoName);
              nextEvoElement.appendChild(nextEvoNum);
              
              // Ajouter un gestionnaire d'événement pour naviguer vers cette évolution
              nextEvoElement.addEventListener('click', () => this.openPokemonDetails(nextEvolution.id));
              
              evoChain.appendChild(nextEvoElement);
            }
          });
        }
        
        evoSection.appendChild(evoChain);
        detailsContainer.appendChild(evoSection);
      }
      
      // Ajouter tous les détails à la popup et l'afficher
      this.popupContent.appendChild(detailsContainer);
      this.popup.style.display = 'flex';
      
    } catch (error) {
      // Gérer les erreurs
      console.error('Erreur lors du chargement des détails du Pokémon:', error);
      this.popupContent.innerHTML = `<div class="error-message">Impossible de charger les détails: ${error.message}</div>`;
      this.popup.style.display = 'flex';
    }
  }

  // Méthode pour fermer la popup
  closePopup() {
    this.popup.style.display = 'none';
  }

  // Méthode pour afficher un message hors ligne
  showOfflineMessage() {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'offline-message';
    messageContainer.innerHTML = `
      <div class="offline-banner">
        🔌 Mode Hors Ligne | ${this.pokemons.length} Pokémon disponibles
        <button class="retry-btn" onclick="location.reload()">🔄 Réessayer</button>
      </div>
    `;

    // Insérer le message avant le conteneur principal
    const mainContainer = document.getElementById('pokemon-container');
    if (mainContainer && mainContainer.parentNode) {
      mainContainer.parentNode.insertBefore(messageContainer, mainContainer);
    }

    // Style du message
    const style = document.createElement('style');
    style.textContent = `
      .offline-banner {
        background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        margin: 10px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }
      .retry-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 8px 15px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
      }
      .retry-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
      }
    `;
    document.head.appendChild(style);
  }

  // Méthode fallback pour créer une image normale (sans lazy loading)
  createRegularImage(src, alt) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.className = 'pokemon-image';
    img.onerror = function() {
      this.onerror = null;
      this.src = "./image/inconnu.png";
    };
    return img;
  }
}

// Initialiser le gestionnaire de Pokémons quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const pokemonManager = new PokemonManager();
  pokemonManager.fetchPokemons();
});
