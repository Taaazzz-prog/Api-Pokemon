/**
 * Gestionnaire de chemins pour l'application Pokédx
 * @description Centralise la gestion des chemins pour faciliter la maintenance
 * @version 2.1.0
 */

class PathManager {
  constructor() {
    // Détection automatique du niveau de profondeur dans l'arborescence
    this.depth = this.calculateDepth();
    this.basePath = '../'.repeat(this.depth);
  }

  /**
   * Calcule la profondeur du fichier actuel par rapport à la racine
   * @returns {number} Nombre de niveaux de profondeur
   */
  calculateDepth() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(segment => segment && segment !== 'index.html');
    
    // Si nous sommes dans un sous-dossier (pages/, docs/, etc.)
    if (segments.length > 1) {
      return 1; // La plupart des sous-pages sont à un niveau de profondeur
    }
    return 0; // Fichier à la racine
  }

  /**
   * Construit un chemin vers un asset
   * @param {string} assetPath - Chemin relatif depuis assets/
   * @returns {string} Chemin complet vers l'asset
   */
  asset(assetPath) {
    return `${this.basePath}assets/${assetPath}`;
  }

  /**
   * Construit un chemin vers une image
   * @param {string} imagePath - Chemin relatif depuis assets/images/
   * @returns {string} Chemin complet vers l'image
   */
  image(imagePath) {
    return this.asset(`images/${imagePath}`);
  }

  /**
   * Construit un chemin vers une icône
   * @param {string} iconPath - Chemin relatif depuis assets/icons/
   * @returns {string} Chemin complet vers l'icône
   */
  icon(iconPath) {
    return this.asset(`icons/${iconPath}`);
  }

  /**
   * Construit un chemin vers un fichier CSS
   * @param {string} cssFile - Nom du fichier CSS
   * @returns {string} Chemin complet vers le CSS
   */
  css(cssFile) {
    return `${this.basePath}src/css/${cssFile}`;
  }

  /**
   * Construit un chemin vers un fichier JavaScript
   * @param {string} jsPath - Chemin relatif depuis src/js/
   * @returns {string} Chemin complet vers le JavaScript
   */
  js(jsPath) {
    return `${this.basePath}src/js/${jsPath}`;
  }

  /**
   * Construit un chemin vers un module JavaScript
   * @param {string} moduleName - Nom du module
   * @returns {string} Chemin complet vers le module
   */
  module(moduleName) {
    return this.js(`modules/${moduleName}`);
  }

  /**
   * Construit un chemin vers un utilitaire JavaScript
   * @param {string} utilName - Nom de l'utilitaire
   * @returns {string} Chemin complet vers l'utilitaire
   */
  util(utilName) {
    return this.js(`utils/${utilName}`);
  }

  /**
   * Construit un chemin vers une page
   * @param {string} pageName - Nom de la page
   * @returns {string} Chemin complet vers la page
   */
  page(pageName) {
    if (this.depth === 0) {
      return `pages/${pageName}`;
    }
    return `./${pageName}`;
  }

  /**
   * Construit un chemin vers la racine
   * @param {string} fileName - Nom du fichier à la racine
   * @returns {string} Chemin complet vers le fichier racine
   */
  root(fileName = '') {
    return `${this.basePath}${fileName}`;
  }

  /**
   * Construit un chemin vers une image Pokémon
   * @param {string} type - Type du Pokémon
   * @param {string} pokemonName - Nom du Pokémon
   * @returns {string} Chemin complet vers l'image Pokémon
   */
  pokemonImage(type, pokemonName) {
    return this.image(`pokemon_images/${type}/${pokemonName}.png`);
  }

  /**
   * Construit un chemin vers un logo de type
   * @param {string} typeName - Nom du type
   * @param {string} extension - Extension du fichier (png, webp)
   * @returns {string} Chemin complet vers le logo de type
   */
  typeLogo(typeName, extension = 'png') {
    return this.icon(`logo/${typeName}.${extension}`);
  }

  /**
   * Met à jour tous les liens et assets de la page courante
   */
  updatePagePaths() {
    // Mettre à jour les liens CSS
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('.css') && !href.startsWith('http')) {
        if (href.includes('styles.css')) {
          link.href = this.css('styles.css');
        } else if (href.includes('style.css')) {
          link.href = this.css('style.css');
        }
      }
    });

    // Mettre à jour les images
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http') && !src.startsWith('data:')) {
        if (src.includes('banniere.png')) {
          img.src = this.image('ui/banniere.png');
        } else if (src.includes('pokeball.png')) {
          img.src = this.image('ui/pokeball.png');
        }
      }
    });

    // Mettre à jour les liens de navigation
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
        if (href.includes('index.html') && this.depth > 0) {
          link.href = this.root('index.html');
        } else if (href.includes('.html') && !href.startsWith('../') && this.depth === 0) {
          const fileName = href.split('/').pop();
          if (fileName !== 'index.html') {
            link.href = this.page(fileName);
          }
        }
      }
    });

    // Mettre à jour les favicons
    document.querySelectorAll('link[rel*="icon"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http')) {
        link.href = this.image('ui/pokeball.png');
      }
    });
  }
}

// Instance globale
window.pathManager = new PathManager();

// Auto-mise à jour des chemins au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  window.pathManager.updatePagePaths();
});

// Export pour les modules ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PathManager;
}