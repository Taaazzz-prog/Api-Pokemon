/*
 * Script de validation et de tests pour le site Pokémon
 * Détecte et rapporte les erreurs potentielles
 */

class SiteValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  // Tester la structure HTML
  testHTMLStructure() {
    console.log('🔍 Test de la structure HTML...');
    
    // Vérifier la balise DOCTYPE
    if (document.doctype && document.doctype.name === 'html') {
      this.successes.push('✅ DOCTYPE HTML5 correct');
    } else {
      this.errors.push('❌ DOCTYPE manquant ou incorrect');
    }

    // Vérifier les balises meta essentielles
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      this.successes.push('✅ Meta viewport présent');
    } else {
      this.errors.push('❌ Meta viewport manquant');
    }

    const charset = document.querySelector('meta[charset]');
    if (charset) {
      this.successes.push('✅ Meta charset présent');
    } else {
      this.errors.push('❌ Meta charset manquant');
    }

    // Vérifier la feuille de style
    const stylesheet = document.querySelector('link[rel="stylesheet"]');
    if (stylesheet) {
      this.successes.push('✅ Feuille de style liée');
    } else {
      this.errors.push('❌ Feuille de style manquante');
    }
  }

  // Tester les scripts JavaScript
  testJavaScript() {
    console.log('🔍 Test des scripts JavaScript...');
    
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      try {
        // Test de présence des gestionnaires globaux
        if (script.src.includes('theme-manager') && window.themeManager) {
          this.successes.push('✅ Theme Manager chargé');
        }
        if (script.src.includes('lazy-load') && window.lazyLoadManager) {
          this.successes.push('✅ Lazy Load Manager chargé');
        }
        if (script.src.includes('pagination') && window.paginationManager) {
          this.successes.push('✅ Pagination Manager chargé');
        }
      } catch (error) {
        this.errors.push(`❌ Erreur dans ${script.src}: ${error.message}`);
      }
    });
  }

  // Tester les images
  testImages() {
    console.log('🔍 Test des images...');
    
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt) {
        this.warnings.push(`⚠️ Image ${index + 1} sans attribut alt`);
      }
      
      if (img.complete && img.naturalWidth === 0) {
        this.errors.push(`❌ Image ${img.src} ne charge pas`);
      } else if (img.complete) {
        this.successes.push(`✅ Image ${img.alt || 'sans nom'} chargée`);
      }
    });
  }

  // Tester l'accessibilité
  testAccessibility() {
    console.log('🔍 Test d\'accessibilité...');
    
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, index) => {
      if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
        this.warnings.push(`⚠️ Bouton ${index + 1} sans label accessible`);
      }
    });

    const links = document.querySelectorAll('a');
    links.forEach((link, index) => {
      if (!link.textContent.trim()) {
        this.warnings.push(`⚠️ Lien ${index + 1} sans texte`);
      }
    });
  }

  // Tester le responsive design
  testResponsive() {
    console.log('🔍 Test du responsive design...');
    
    const viewport = window.innerWidth;
    
    if (viewport <= 768) {
      const hamburger = document.querySelector('.hamburger-btn');
      if (hamburger) {
        this.successes.push('✅ Menu hamburger présent sur mobile');
      } else {
        this.warnings.push('⚠️ Menu hamburger manquant sur mobile');
      }
    }

    // Tester les media queries CSS
    if (window.matchMedia) {
      const mobileQuery = window.matchMedia('(max-width: 768px)');
      this.successes.push(`✅ Media queries supportées (mobile: ${mobileQuery.matches})`);
    }
  }

  // Exécuter tous les tests
  runAllTests() {
    console.log('🚀 Démarrage de la validation complète...\n');
    
    this.testHTMLStructure();
    this.testJavaScript();
    this.testImages();
    this.testAccessibility();
    this.testResponsive();
    
    this.displayResults();
  }

  // Afficher les résultats
  displayResults() {
    console.log('\n📊 RÉSULTATS DE LA VALIDATION:\n');
    
    console.log('✅ SUCCÈS:');
    this.successes.forEach(success => console.log(`  ${success}`));
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ AVERTISSEMENTS:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERREURS:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }
    
    console.log(`\n📈 SCORE: ${this.successes.length} succès, ${this.warnings.length} avertissements, ${this.errors.length} erreurs`);
    
    if (this.errors.length === 0) {
      console.log('🎉 Aucune erreur critique détectée !');
    }
  }
}

// Exécuter la validation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  // Attendre un peu que tous les scripts se chargent
  setTimeout(() => {
    const validator = new SiteValidator();
    validator.runAllTests();
  }, 1000);
});

// Export pour utilisation dans d'autres scripts
window.SiteValidator = SiteValidator;