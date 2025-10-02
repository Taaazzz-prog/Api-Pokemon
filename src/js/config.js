/**
 * Configuration générale de l'application Pokédex
 * @description Fichier de configuration centralisé pour l'application
 * @version 2.1.0
 */

// Constantes de l'application
export const APP_CONFIG = {
  // Information de l'application
  APP_NAME: 'Pokédx Le Repaire des Dresseurs',
  VERSION: '2.1.0',
  DESCRIPTION: 'Progressive Web App complète pour explorer l\'univers Pokémon',
  
  // API Configuration
  API: {
    BASE_URL: 'https://pokebuild-api.fr/api/v1',
    ENDPOINTS: {
      POKEMON_LIST: '/pokemon',
      POKEMON_DETAIL: '/pokemon/',
      TYPES: '/types',
      GENERATIONS: '/generations'
    },
    TIMEOUT: 10000, // 10 secondes
    RETRY_ATTEMPTS: 3
  },
  
  // Chemins des ressources
  PATHS: {
    CSS: './src/css/',
    JS: './src/js/',
    MODULES: './src/js/modules/',
    UTILS: './src/js/utils/',
    IMAGES: './assets/images/',
    ICONS: './assets/icons/',
    PAGES: './pages/'
  },
  
  // Configuration de l'interface
  UI: {
    ITEMS_PER_PAGE: 24,
    SEARCH_DEBOUNCE: 300,
    ANIMATION_DURATION: 250,
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024
  },
  
  // Configuration du cache
  CACHE: {
    POKEMON_STORAGE_KEY: 'pokemon_cache',
    FAVORITES_KEY: 'pokemon_favorites',
    HISTORY_KEY: 'search_history',
    THEME_KEY: 'selected_theme',
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 heures
    MAX_HISTORY_ITEMS: 10
  },
  
  // Configuration PWA
  PWA: {
    SW_PATH: './service-worker.js',
    MANIFEST_PATH: './manifest.json',
    CACHE_NAME: 'pokemon-app-v2.1.0',
    OFFLINE_PAGE: './pages/offline.html'
  },
  
  // Types Pokémon avec couleurs
  POKEMON_TYPES: {
    'Normal': '#A8A878',
    'Feu': '#F08030',
    'Eau': '#6890F0',
    'Électrik': '#F8D030',
    'Plante': '#78C850',
    'Glace': '#98D8D8',
    'Combat': '#C03028',
    'Poison': '#A040A0',
    'Sol': '#E0C068',
    'Vol': '#A890F0',
    'Psy': '#F85888',
    'Insecte': '#A8B820',
    'Roche': '#B8A038',
    'Spectre': '#705898',
    'Dragon': '#7038F8',
    'Ténèbres': '#705848',
    'Acier': '#B8B8D0',
    'Fée': '#EE99AC'
  },
  
  // Générations Pokémon
  GENERATIONS: {
    1: { name: 'Kanto', range: [1, 151] },
    2: { name: 'Johto', range: [152, 251] },
    3: { name: 'Hoenn', range: [252, 386] },
    4: { name: 'Sinnoh', range: [387, 493] },
    5: { name: 'Unys', range: [494, 649] },
    6: { name: 'Kalos', range: [650, 721] },
    7: { name: 'Alola', range: [722, 809] },
    8: { name: 'Galar', range: [810, 898] }
  },
  
  // Messages d'erreur
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
    API_ERROR: 'Erreur lors de la récupération des données.',
    NOT_FOUND: 'Aucun Pokémon trouvé avec ces critères.',
    LOADING_ERROR: 'Erreur lors du chargement de la page.',
    CACHE_ERROR: 'Erreur lors de la sauvegarde des données.'
  },
  
  // Configuration des logs
  LOGGING: {
    ENABLED: true,
    LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    CONSOLE_COLORS: {
      debug: '#95a5a6',
      info: '#3498db',
      warn: '#f39c12',
      error: '#e74c3c',
      success: '#27ae60'
    }
  }
};

// Données de fallback (version simplifiée)
export const FALLBACK_DATA = {
  pokemon: [
    { id: 1, name: 'Bulbizarre', types: ['Plante', 'Poison'] },
    { id: 4, name: 'Salamèche', types: ['Feu'] },
    { id: 7, name: 'Carapuce', types: ['Eau'] },
    { id: 25, name: 'Pikachu', types: ['Électrik'] },
    { id: 39, name: 'Rondoudou', types: ['Normal', 'Fée'] },
    { id: 54, name: 'Psykokwak', types: ['Eau'] },
    { id: 104, name: 'Osselait', types: ['Sol'] },
    { id: 132, name: 'Métamorph', types: ['Normal'] },
    { id: 143, name: 'Ronflex', types: ['Normal'] },
    { id: 150, name: 'Mewtwo', types: ['Psy'] },
    { id: 151, name: 'Mew', types: ['Psy'] },
    { id: 155, name: 'Héricendre', types: ['Feu'] },
    { id: 158, name: 'Kaiminus', types: ['Eau'] },
    { id: 172, name: 'Pichu', types: ['Électrik'] },
    { id: 249, name: 'Lugia', types: ['Psy', 'Vol'] }
  ]
};

// Configuration par défaut
export default APP_CONFIG;