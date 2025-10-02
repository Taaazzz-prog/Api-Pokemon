class AssetMinifier {
  constructor() {
    this.isProduction = location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
    this.bundleCache = new Map();
    this.bundles = new Map(); // Initialiser la Map des bundles
    this.compressionRatio = 0;
    this.init();
  }

  init() {
    if (this.isProduction) {
      this.setupMinification();
      this.setupBundling();
      this.createManagementInterface();
    }
    
    // Initialiser avec quelques données de test pour les statistiques
    this.initializeTestBundles();
  }

  initializeTestBundles() {
    // Ajouter des bundles de test avec des tailles simulées
    this.bundles.set('critical-css', {
      size: 1500,
      compressedSize: 1200,
      type: 'css'
    });
    
    this.bundles.set('main-js', {
      size: 5000,
      compressedSize: 3500,
      type: 'js'
    });
    
    this.bundles.set('vendor-js', {
      size: 8000,
      compressedSize: 6000,
      type: 'js'
    });
  }

  setupMinification() {
    // Minifier le CSS critique inline
    this.minifyInlineCSS();
    
    // Précharger les ressources critiques
    this.preloadCriticalResources();
    
    // Optimiser le chargement des scripts
    this.optimizeScriptLoading();
  }

  minifyInlineCSS() {
    const styleElements = document.querySelectorAll('style');
    styleElements.forEach(style => {
      if (!style.dataset.minified) {
        const originalCSS = style.textContent;
        const minifiedCSS = this.minifyCSS(originalCSS);
        style.textContent = minifiedCSS;
        style.dataset.minified = 'true';
        
        // Calculer les économies
        const savings = ((originalCSS.length - minifiedCSS.length) / originalCSS.length * 100);
        style.dataset.savings = Math.round(savings);
      }
    });
  }

  minifyCSS(css) {
    return css
      // Supprimer les commentaires
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Supprimer les espaces multiples
      .replace(/\s+/g, ' ')
      // Supprimer les espaces autour des accolades
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      // Supprimer les espaces autour des deux-points et points-virgules
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*;\s*/g, ';')
      // Supprimer les points-virgules avant les accolades fermantes
      .replace(/;}/g, '}')
      // Supprimer les espaces en début et fin
      .trim();
  }

  preloadCriticalResources() {
    const criticalResources = [
      { href: 'styles.css', as: 'style' },
      { href: 'script.js', as: 'script' },
      { href: 'asyncAwait.js', as: 'script' }
    ];

    criticalResources.forEach(resource => {
      if (!document.querySelector(`link[href="${resource.href}"][rel="preload"]`)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.as === 'style') {
          link.onload = () => {
            link.rel = 'stylesheet';
          };
        }
        document.head.appendChild(link);
      }
    });
  }

  optimizeScriptLoading() {
    // Ajouter defer aux scripts non critiques
    const scripts = document.querySelectorAll('script[src]');
    const nonCriticalScripts = [
      'search-history.js',
      'image-optimizer.js',
      'pokemon-comparator.js',
      'search-tests.js'
    ];

    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (nonCriticalScripts.some(name => src.includes(name))) {
        if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
          script.setAttribute('defer', '');
        }
      }
    });
  }

  setupBundling() {
    // Créer des bundles virtuels pour réduire les requêtes HTTP
    this.createVirtualBundles();
  }

  createVirtualBundles() {
    const bundles = {
      core: [
        'script.js',
        'asyncAwait.js',
        'mobile-menu.js'
      ],
      features: [
        'lazy-load.js',
        'pagination.js',
        'theme-manager.js',
        'favorites.js'
      ],
      advanced: [
        'advanced-search.js',
        'accessibility.js',
        'pokemon-comparator.js',
        'search-history.js'
      ],
      utils: [
        'pwa-manager.js',
        'image-optimizer.js',
        'search-tests.js'
      ]
    };

    // Charger les bundles de manière progressive
    this.loadBundleProgressive('core');
    
    // Charger les features après DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => this.loadBundleProgressive('features'), 100);
    });

    // Charger les fonctionnalités avancées au premier scroll
    let advancedLoaded = false;
    const loadAdvanced = () => {
      if (!advancedLoaded) {
        advancedLoaded = true;
        this.loadBundleProgressive('advanced');
        window.removeEventListener('scroll', loadAdvanced);
        window.removeEventListener('click', loadAdvanced);
      }
    };

    window.addEventListener('scroll', loadAdvanced, { once: true });
    window.addEventListener('click', loadAdvanced, { once: true });

    // Charger les utilitaires après un délai
    setTimeout(() => {
      this.loadBundleProgressive('utils');
    }, 3000);
  }

  async loadBundleProgressive(bundleName) {
    if (this.bundleCache.has(bundleName)) {
      return this.bundleCache.get(bundleName);
    }

    try {
      const bundle = await this.loadBundle(bundleName);
      this.bundleCache.set(bundleName, bundle);
      return bundle;
    } catch (error) {
      console.error(`Erreur chargement bundle ${bundleName}:`, error);
    }
  }

  async loadBundle(bundleName) {
    // En production, on chargerait un bundle minifié
    // Ici, on simule en chargeant les scripts individuellement mais de manière optimisée
    
    const scripts = this.getBundleScripts(bundleName);
    const loadedScripts = [];

    for (const scriptPath of scripts) {
      try {
        await this.loadScriptOptimized(scriptPath);
        loadedScripts.push(scriptPath);
      } catch (error) {
        console.warn(`Erreur chargement script ${scriptPath}:`, error);
      }
    }

    return {
      name: bundleName,
      scripts: loadedScripts,
      loadTime: Date.now()
    };
  }

  getBundleScripts(bundleName) {
    const bundles = {
      core: ['script.js', 'asyncAwait.js', 'mobile-menu.js'],
      features: ['lazy-load.js', 'pagination.js', 'theme-manager.js', 'favorites.js'],
      advanced: ['advanced-search.js', 'accessibility.js', 'pokemon-comparator.js', 'search-history.js'],
      utils: ['pwa-manager.js', 'image-optimizer.js', 'search-tests.js']
    };

    return bundles[bundleName] || [];
  }

  loadScriptOptimized(src) {
    return new Promise((resolve, reject) => {
      // Vérifier si le script est déjà chargé
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      
      document.head.appendChild(script);
    });
  }

  createManagementInterface() {
    // Bouton pour voir les statistiques de minification
    const minifyBtn = document.createElement('button');
    minifyBtn.id = 'minify-stats-btn';
    minifyBtn.className = 'btn btn-secondary minify-btn';
    minifyBtn.innerHTML = '⚡ Optimisation';
    minifyBtn.title = 'Voir les statistiques d\'optimisation';

    // Ajouter aux contrôles (seulement en mode développement pour debug)
    if (!this.isProduction) {
      const controls = document.querySelector('.controls');
      if (controls) {
        controls.appendChild(minifyBtn);
      }
    }

    // Modal des statistiques
    const modal = document.createElement('div');
    modal.id = 'minify-stats-modal';
    modal.className = 'modal minify-stats-modal';
    modal.innerHTML = `
      <div class="modal-content minify-content">
        <div class="modal-header">
          <h2>⚡ Statistiques d'Optimisation</h2>
          <button class="modal-close" aria-label="Fermer">&times;</button>
        </div>
        
        <div class="optimization-summary" id="optimization-summary">
          <!-- Résumé d'optimisation -->
        </div>
        
        <div class="bundle-details" id="bundle-details">
          <!-- Détails des bundles -->
        </div>
        
        <div class="performance-metrics" id="performance-metrics">
          <!-- Métriques de performance -->
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Événements
    minifyBtn?.addEventListener('click', () => {
      this.showOptimizationStats();
    });

    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  showOptimizationStats() {
    const modal = document.getElementById('minify-stats-modal');
    modal.classList.add('active');
    this.renderOptimizationStats();
  }

  renderOptimizationStats() {
    const summary = document.getElementById('optimization-summary');
    const bundleDetails = document.getElementById('bundle-details');
    const performanceMetrics = document.getElementById('performance-metrics');

    // Résumé
    const stats = this.calculateOptimizationStats();
    
    summary.innerHTML = `
      <div class="optimization-grid">
        <div class="opt-card">
          <div class="opt-number">${stats.totalRequests}</div>
          <div class="opt-label">Requêtes HTTP</div>
        </div>
        <div class="opt-card success">
          <div class="opt-number">${stats.bundlesLoaded}</div>
          <div class="opt-label">Bundles Chargés</div>
        </div>
        <div class="opt-card info">
          <div class="opt-number">${stats.compressionRatio}%</div>
          <div class="opt-label">Compression</div>
        </div>
        <div class="opt-card warning">
          <div class="opt-number">${stats.loadTime}ms</div>
          <div class="opt-label">Temps Chargement</div>
        </div>
      </div>
    `;

    // Détails des bundles
    bundleDetails.innerHTML = `
      <h3>Détails des Bundles</h3>
      <div class="bundle-list">
        ${Array.from(this.bundleCache.entries()).map(([name, bundle]) => `
          <div class="bundle-item">
            <div class="bundle-name">${name}</div>
            <div class="bundle-scripts">${bundle.scripts.length} scripts</div>
            <div class="bundle-size">Chargé à ${new Date(bundle.loadTime).toLocaleTimeString()}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Métriques de performance
    if (window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');

      performanceMetrics.innerHTML = `
        <h3>Métriques de Performance</h3>
        <div class="metrics-grid">
          <div class="metric-item">
            <strong>DOM Content Loaded:</strong> ${Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart)}ms
          </div>
          <div class="metric-item">
            <strong>Page Load Complete:</strong> ${Math.round(navigation.loadEventEnd - navigation.navigationStart)}ms
          </div>
          <div class="metric-item">
            <strong>Ressources Chargées:</strong> ${resources.length}
          </div>
          <div class="metric-item">
            <strong>Scripts JS:</strong> ${resources.filter(r => r.name.endsWith('.js')).length}
          </div>
        </div>
      `;
    }
  }

  calculateOptimizationStats() {
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('style[data-minified]');
    
    let totalSavings = 0;
    let savingsCount = 0;

    styles.forEach(style => {
      const savings = parseInt(style.dataset.savings) || 0;
      if (savings > 0) {
        totalSavings += savings;
        savingsCount++;
      }
    });

    return {
      totalRequests: scripts.length,
      bundlesLoaded: this.bundleCache.size,
      compressionRatio: savingsCount > 0 ? Math.round(totalSavings / savingsCount) : 0,
      loadTime: performance.now()
    };
  }

  // Méthode pour compresser du texte (simulation)
  compressText(text) {
    // Simulation de compression gzip
    const compressed = text
      .replace(/\s+/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
    
    this.compressionRatio = ((text.length - compressed.length) / text.length * 100);
    return compressed;
  }

  // Méthode pour optimiser les ressources critiques
  optimizeCriticalPath() {
    // Inliner le CSS critique
    this.inlineCriticalCSS();
    
    // Précharger les ressources importantes
    this.preloadImportantResources();
    
    // Lazy load des ressources non critiques
    this.lazyLoadNonCritical();
  }

  inlineCriticalCSS() {
    // CSS critique pour le above-the-fold
    const criticalCSS = `
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .header { display: flex; align-items: center; padding: 1rem; background: #1e40af; }
      .loading { display: flex; justify-content: center; padding: 2rem; }
      .pokemon-grid { display: grid; gap: 1rem; padding: 1rem; }
      @media (min-width: 768px) { .pokemon-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); } }
    `;

    // Ajouter le CSS critique inline si pas déjà présent
    if (!document.querySelector('#critical-css')) {
      const style = document.createElement('style');
      style.id = 'critical-css';
      style.textContent = this.minifyCSS(criticalCSS);
      document.head.insertBefore(style, document.head.firstChild);
    }
  }

  preloadImportantResources() {
    const importantResources = [
      'https://pokebuildapi.fr/api/v1/pokemon',
      'image/logo.png',
      'image/pokeball.png'
    ];

    importantResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.startsWith('http')) {
        link.href = resource;
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
      } else {
        link.href = resource;
        link.as = 'image';
      }
      
      document.head.appendChild(link);
    });
  }

  lazyLoadNonCritical() {
    // Lazy load des fonctionnalités non critiques
    const nonCriticalFeatures = [
      'pokemon-comparator.js',
      'search-history.js',
      'image-optimizer.js'
    ];

    // Charger au premier interaction utilisateur
    const loadNonCritical = () => {
      nonCriticalFeatures.forEach(script => {
        this.loadScriptOptimized(script);
      });
    };

    // Événements pour déclencher le chargement
    ['scroll', 'click', 'keydown', 'touchstart'].forEach(event => {
      window.addEventListener(event, loadNonCritical, { once: true, passive: true });
    });

    // Fallback après 5 secondes
    setTimeout(loadNonCritical, 5000);
  }

  // Statistiques de compression
  getCompressionStats() {
    const bundles = this.bundles;
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let bundleCount = 0;

    for (const [name, bundle] of bundles) {
      if (bundle.size && bundle.compressedSize) {
        totalOriginalSize += bundle.size;
        totalCompressedSize += bundle.compressedSize;
        bundleCount++;
      }
    }

    const compressionRatio = totalOriginalSize > 0 
      ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1)
      : '0.0';

    return {
      bundleCount,
      totalOriginalSize,
      totalCompressedSize,
      compressionRatio: `${compressionRatio}%`,
      savings: totalOriginalSize - totalCompressedSize,
      bundles: Array.from(bundles.entries()).map(([name, bundle]) => ({
        name,
        originalSize: bundle.size || 0,
        compressedSize: bundle.compressedSize || 0,
        ratio: bundle.size && bundle.compressedSize 
          ? (((bundle.size - bundle.compressedSize) / bundle.size) * 100).toFixed(1) + '%'
          : '0%'
      }))
    };
  }
}

// Initialiser le minifieur d'assets
window.addEventListener('DOMContentLoaded', () => {
  window.assetMinifier = new AssetMinifier();
});

// Export pour utilisation dans d'autres modules
window.AssetMinifier = AssetMinifier;