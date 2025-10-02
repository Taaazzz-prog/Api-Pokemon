# Structure du Projet - Pokédx Le Repaire des Dresseurs

## 📁 Organisation des fichiers

```
Pokemon/
│
├── 📄 index.html              # Page d'accueil principale
├── 📄 manifest.json           # Manifest PWA
├── 📄 service-worker.js       # Service Worker PWA
├── 📄 README.md               # Documentation principale
├── 📄 TODO.md                 # Liste des tâches
│
├── 📁 src/                    # Code source
│   ├── 📁 css/                # Feuilles de style
│   │   ├── style.css          # Styles principaux
│   │   └── styles.css         # Styles complémentaires
│   │
│   └── 📁 js/                 # Scripts JavaScript
│       ├── 📄 config.js       # Configuration générale
│       ├── 📄 app-initializer.js    # Initialisation de l'app
│       ├── 📄 asyncAwait.js   # Gestionnaire API principal
│       ├── 📄 script.js       # Script principal
│       ├── 📄 menu.js         # Navigation menu
│       ├── 📄 mobile-menu.js  # Menu mobile
│       ├── 📄 options-panel.js # Panneau d'options
│       ├── 📄 pokemon-fallback-data.js # Données de secours
│       ├── 📄 rechercher.js   # Recherche simple
│       ├── 📄 generation.js   # Navigation par génération
│       ├── 📄 telecharger.js  # Téléchargement d'images
│       │
│       ├── 📁 modules/        # Modules fonctionnels
│       │   ├── favorites.js           # Gestion des favoris
│       │   ├── pokemon-comparator.js  # Comparateur Pokémon
│       │   ├── search-history.js      # Historique de recherche
│       │   ├── advanced-search.js     # Recherche avancée
│       │   ├── theme-manager.js       # Gestionnaire de thèmes
│       │   └── pwa-manager.js         # Gestionnaire PWA
│       │
│       └── 📁 utils/          # Utilitaires
│           ├── lazy-load.js           # Chargement paresseux
│           ├── image-optimizer.js     # Optimisation d'images
│           ├── validator.js           # Validation des données
│           ├── cdn-manager.js         # Gestionnaire CDN
│           ├── asset-minifier.js      # Minification
│           ├── pagination.js          # Pagination
│           └── accessibility.js       # Accessibilité
│
├── 📁 pages/                  # Pages secondaires
│   ├── generation.html        # Page par génération
│   ├── liste.html            # Liste complète
│   └── nouvelles-fonctionnalites.html # Nouvelles fonctionnalités
│
├── 📁 assets/                 # Ressources statiques
│   ├── 📁 images/             # Images
│   │   ├── 📁 ui/             # Images d'interface
│   │   └── 📁 pokemon_images/ # Images Pokémon par type
│   │       ├── 📁 Acier/
│   │       ├── 📁 Combat/
│   │       ├── 📁 Dragon/
│   │       ├── 📁 Eau/
│   │       ├── 📁 Électrik/
│   │       ├── 📁 Fée/
│   │       ├── 📁 Feu/
│   │       ├── 📁 Glace/
│   │       ├── 📁 Insecte/
│   │       ├── 📁 Normal/
│   │       ├── 📁 Plante/
│   │       ├── 📁 Poison/
│   │       ├── 📁 Psy/
│   │       ├── 📁 Roche/
│   │       ├── 📁 Sol/
│   │       ├── 📁 Spectre/
│   │       ├── 📁 Ténèbres/
│   │       └── 📁 Vol/
│   │
│   └── 📁 icons/              # Icônes
│       └── 📁 logo/           # Logos et icônes de types
│
└── 📁 docs/                   # Documentation
    ├── DEPLOYMENT-GUIDE.md    # Guide de déploiement
    ├── CDN-SETUP.md          # Configuration CDN
    ├── analyse-site-pokemon.md # Analyse du site
    └── NOUVELLES-FONCTIONNALITES.md # Documentation des fonctionnalités
```

## 🔧 Conventions de nommage

### Fichiers
- **JavaScript** : kebab-case (ex: `pokemon-comparator.js`)
- **CSS** : kebab-case (ex: `main-styles.css`)
- **HTML** : kebab-case (ex: `nouvelles-fonctionnalites.html`)
- **Images** : PascalCase pour Pokémon, kebab-case pour UI

### Code
- **Variables** : camelCase (ex: `pokemonList`)
- **Constantes** : UPPER_SNAKE_CASE (ex: `API_BASE_URL`)
- **Fonctions** : camelCase (ex: `loadPokemonData`)
- **Classes** : PascalCase (ex: `PokemonComparator`)

## 📦 Modules principaux

### Core (`src/js/`)
- `config.js` - Configuration centralisée
- `app-initializer.js` - Point d'entrée principal
- `asyncAwait.js` - Gestionnaire API
- `script.js` - Logique principale

### Modules (`src/js/modules/`)
- `favorites.js` - Système de favoris
- `pokemon-comparator.js` - Comparaison de Pokémon
- `search-history.js` - Historique des recherches
- `advanced-search.js` - Filtres avancés
- `theme-manager.js` - Thèmes sombre/clair
- `pwa-manager.js` - Fonctionnalités PWA

### Utilitaires (`src/js/utils/`)
- `lazy-load.js` - Chargement différé
- `image-optimizer.js` - Optimisation images
- `validator.js` - Validation des données
- `pagination.js` - Système de pagination
- `accessibility.js` - Support accessibilité

## 🚀 Guidelines de développement

### Ajout d'une nouvelle fonctionnalité
1. Créer le module dans `src/js/modules/`
2. Ajouter les tests appropriés
3. Mettre à jour la configuration si nécessaire
4. Documenter dans `docs/`

### Modification d'un module existant
1. Respecter l'API existante
2. Maintenir la compatibilité ascendante
3. Mettre à jour la documentation
4. Tester sur mobile et desktop

### Structure d'un module
```javascript
/**
 * @fileoverview Description du module
 * @version 1.0.0
 */

import { APP_CONFIG } from '../config.js';

export class MonModule {
  constructor(options = {}) {
    this.options = { ...APP_CONFIG.DEFAULT_OPTIONS, ...options };
    this.init();
  }

  init() {
    // Initialisation
  }

  // Méthodes publiques
  
  // Méthodes privées (préfixées par _)
}
```

## 🔄 Workflow de déploiement

1. **Développement** : Modifier les fichiers dans `src/`
2. **Test** : Valider sur navigateurs multiples
3. **Build** : Optimiser les assets si nécessaire
4. **Commit** : Message descriptif du changement
5. **Push** : Déploiement automatique vers GitHub

## 📱 Compatibilité

- **Navigateurs** : Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Appareils** : Desktop, tablette, mobile
- **PWA** : Installation disponible sur tous supports
- **Hors ligne** : Fonctionnalités de base disponibles

Cette structure assure une maintenance facilitée et une évolutivité optimale du projet.