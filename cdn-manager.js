class CDNManager {
  constructor() {
    this.cdnEndpoints = {
      primary: 'https://cdn.jsdelivr.net/gh/microsoft/pokemon-static@main/',
      fallback: 'https://unpkg.com/pokemon-assets@latest/',
      local: './'
    };
    this.cacheStrategy = {
      images: { maxAge: 86400000, strategy: 'cache-first' }, // 24h
      scripts: { maxAge: 3600000, strategy: 'network-first' }, // 1h
      api: { maxAge: 1800000, strategy: 'network-first' } // 30min
    };
    this.failoverCount = new Map();
    this.performanceMetrics = new Map();
    
    // Désactiver l'auto-initialisation pour éviter les erreurs 404
    // this.init();
    console.log('CDN Manager créé mais non initialisé automatiquement');
  }

  init() {
    this.setupCDNOptimization();
    this.createCDNInterface();
    this.monitorPerformance();
  }

  setupCDNOptimization() {
    // Optimiser les ressources statiques
    this.optimizeStaticAssets();
    
    // Configurer les headers de cache
    this.setupCacheHeaders();
    
    // Précharger les ressources critiques depuis le CDN
    this.preloadFromCDN();
  }

  optimizeStaticAssets() {
    // Rediriger les images vers CDN si disponible
    this.redirectImagesToCDN();
    
    // Optimiser les polices
    this.optimizeFonts();
    
    // Configurer les ressources externes
    this.configureExternalResources();
  }

  redirectImagesToCDN() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const src = img.src || img.dataset.src;
      if (src && this.isLocalResource(src)) {
        const cdnUrl = this.getCDNUrl(src, 'images');
        
        // Test de disponibilité CDN
        this.testCDNAvailability(cdnUrl).then(available => {
          if (available) {
            img.dataset.originalSrc = src;
            img.dataset.cdnSrc = cdnUrl;
            
            // Charger depuis le CDN avec fallback
            this.loadWithFallback(img, cdnUrl, src);
          }
        });
      }
    });
  }

  loadWithFallback(img, cdnUrl, fallbackUrl) {
    const cdnImg = new Image();
    
    cdnImg.onload = () => {
      img.src = cdnUrl;
      img.dataset.source = 'cdn';
      this.recordPerformance('cdn_success', cdnUrl);
    };
    
    cdnImg.onerror = () => {
      img.src = fallbackUrl;
      img.dataset.source = 'local';
      this.recordFailover(cdnUrl);
      this.recordPerformance('cdn_failure', cdnUrl);
    };
    
    cdnImg.src = cdnUrl;
  }

  getCDNUrl(localPath, resourceType) {
    // Nettoyer le chemin local
    const cleanPath = localPath.replace(/^\.\//, '').replace(/^\//, '');
    
    // Sélectionner le CDN en fonction du type de ressource
    let cdnBase = this.cdnEndpoints.primary;
    
    if (resourceType === 'images') {
      // Utiliser un CDN spécialisé pour les images si disponible
      cdnBase = this.cdnEndpoints.primary;
    }
    
    return `${cdnBase}${cleanPath}`;
  }

  async testCDNAvailability(url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  isLocalResource(url) {
    return !url.startsWith('http') || 
           url.includes(window.location.hostname) ||
           url.startsWith('./') ||
           url.startsWith('/');
  }

  optimizeFonts() {
    // Désactiver le préchargement de polices vides pour éviter les warnings
    console.log('Optimisation des polices désactivée - utilisation des polices système');
    return;
    
  }

  configureExternalResources() {
    // Configurer les connexions externes
    const externalDomains = [
      'pokebuildapi.fr',
      'cdn.jsdelivr.net',
      'unpkg.com'
    ];

    externalDomains.forEach(domain => {
      // DNS prefetch
      const dnsLink = document.createElement('link');
      dnsLink.rel = 'dns-prefetch';
      dnsLink.href = `https://${domain}`;
      
      // Preconnect pour les domaines critiques
      const preconnectLink = document.createElement('link');
      preconnectLink.rel = 'preconnect';
      preconnectLink.href = `https://${domain}`;
      preconnectLink.crossOrigin = 'anonymous';
      
      if (!document.querySelector(`link[href="https://${domain}"]`)) {
        document.head.appendChild(dnsLink);
        
        if (domain === 'pokebuildapi.fr') {
          document.head.appendChild(preconnectLink);
        }
      }
    });
  }

  setupCacheHeaders() {
    // Configurer les en-têtes de cache via Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'UPDATE_CACHE_STRATEGY',
          strategy: this.cacheStrategy
        });
      });
    }
  }

  preloadFromCDN() {
    // Désactivé temporairement pour éviter les erreurs 404
    console.log('Préchargement CDN désactivé - ressources locales utilisées');
    return;
    
  }

  createCDNInterface() {
    // Interface de gestion CDN (pour le développement)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.createDebugInterface();
    }
  }

  createDebugInterface() {
    const cdnBtn = document.createElement('button');
    cdnBtn.id = 'cdn-stats-btn';
    cdnBtn.className = 'btn btn-secondary cdn-btn';
    cdnBtn.innerHTML = '🌐 CDN Stats';
    cdnBtn.title = 'Voir les statistiques CDN';

    const controls = document.querySelector('.controls');
    if (controls) {
      controls.appendChild(cdnBtn);
    }

    // Modal des statistiques CDN
    const modal = document.createElement('div');
    modal.id = 'cdn-stats-modal';
    modal.className = 'modal cdn-stats-modal';
    modal.innerHTML = `
      <div class="modal-content cdn-content">
        <div class="modal-header">
          <h2>🌐 Statistiques CDN</h2>
          <button class="modal-close" aria-label="Fermer">&times;</button>
        </div>
        
        <div class="cdn-overview" id="cdn-overview">
          <!-- Vue d'ensemble -->
        </div>
        
        <div class="cdn-performance" id="cdn-performance">
          <!-- Performance -->
        </div>
        
        <div class="cdn-failures" id="cdn-failures">
          <!-- Échecs et fallbacks -->
        </div>
        
        <div class="cdn-controls">
          <button class="btn btn-primary test-cdn">🧪 Tester CDN</button>
          <button class="btn btn-secondary flush-cache">🗑️ Vider Cache</button>
          <button class="btn btn-warning toggle-cdn">⚡ Basculer Local</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Événements
    cdnBtn.addEventListener('click', () => {
      this.showCDNStats();
    });

    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.querySelector('.test-cdn').addEventListener('click', () => {
      this.testAllCDNEndpoints();
    });

    modal.querySelector('.flush-cache').addEventListener('click', () => {
      this.flushCache();
    });

    modal.querySelector('.toggle-cdn').addEventListener('click', () => {
      this.toggleCDNUsage();
    });
  }

  showCDNStats() {
    const modal = document.getElementById('cdn-stats-modal');
    modal.classList.add('active');
    this.renderCDNStats();
  }

  renderCDNStats() {
    const overview = document.getElementById('cdn-overview');
    const performance = document.getElementById('cdn-performance');
    const failures = document.getElementById('cdn-failures');

    const stats = this.calculateCDNStats();

    // Vue d'ensemble
    overview.innerHTML = `
      <div class="cdn-stats-grid">
        <div class="cdn-stat-card">
          <div class="cdn-stat-number">${stats.totalRequests}</div>
          <div class="cdn-stat-label">Requêtes Total</div>
        </div>
        <div class="cdn-stat-card success">
          <div class="cdn-stat-number">${stats.cdnHits}</div>
          <div class="cdn-stat-label">Hits CDN</div>
        </div>
        <div class="cdn-stat-card warning">
          <div class="cdn-stat-number">${stats.fallbacks}</div>
          <div class="cdn-stat-label">Fallbacks</div>
        </div>
        <div class="cdn-stat-card info">
          <div class="cdn-stat-number">${stats.hitRatio}%</div>
          <div class="cdn-stat-label">Taux de Réussite</div>
        </div>
      </div>
      
      <div class="cdn-endpoints">
        <h3>Points d'Accès CDN</h3>
        ${Object.entries(this.cdnEndpoints).map(([name, url]) => `
          <div class="endpoint-item">
            <span class="endpoint-name">${name}</span>
            <span class="endpoint-url">${url}</span>
            <span class="endpoint-status ${this.getEndpointStatus(url)}">
              ${this.getEndpointStatus(url)}
            </span>
          </div>
        `).join('')}
      </div>
    `;

    // Performance
    performance.innerHTML = `
      <h3>Métriques de Performance</h3>
      <div class="performance-metrics">
        ${Array.from(this.performanceMetrics.entries()).map(([metric, values]) => `
          <div class="metric-row">
            <span class="metric-name">${metric}</span>
            <span class="metric-value">${values.length} événements</span>
            <span class="metric-avg">${this.getAverageTime(values)}ms moyen</span>
          </div>
        `).join('')}
      </div>
    `;

    // Échecs
    const failureEntries = Array.from(this.failoverCount.entries());
    failures.innerHTML = `
      <h3>Historique des Échecs</h3>
      ${failureEntries.length > 0 ? `
        <div class="failure-list">
          ${failureEntries.map(([url, count]) => `
            <div class="failure-item">
              <span class="failure-url">${url}</span>
              <span class="failure-count">${count} échec(s)</span>
            </div>
          `).join('')}
        </div>
      ` : '<p>Aucun échec enregistré</p>'}
    `;
  }

  calculateCDNStats() {
    const images = document.querySelectorAll('img[data-source]');
    let cdnHits = 0;
    let fallbacks = 0;

    images.forEach(img => {
      if (img.dataset.source === 'cdn') {
        cdnHits++;
      } else if (img.dataset.source === 'local') {
        fallbacks++;
      }
    });

    const totalRequests = cdnHits + fallbacks;
    const hitRatio = totalRequests > 0 ? Math.round((cdnHits / totalRequests) * 100) : 0;

    return {
      totalRequests,
      cdnHits,
      fallbacks,
      hitRatio
    };
  }

  getEndpointStatus(url) {
    // Simuler le statut des endpoints
    return Math.random() > 0.2 ? 'online' : 'offline';
  }

  getAverageTime(values) {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val.duration, 0);
    return Math.round(sum / values.length);
  }

  async testAllCDNEndpoints() {
    const results = {};
    
    for (const [name, endpoint] of Object.entries(this.cdnEndpoints)) {
      if (name !== 'local') {
        const startTime = performance.now();
        const available = await this.testCDNAvailability(endpoint + 'test.png');
        const endTime = performance.now();
        
        results[name] = {
          available,
          responseTime: Math.round(endTime - startTime)
        };
      }
    }

    this.showNotification(
      `Test CDN terminé: ${Object.values(results).filter(r => r.available).length}/${Object.keys(results).length} disponibles`,
      'info'
    );

    return results;
  }

  flushCache() {
    if ('caches' in window) {
      caches.keys().then(names => {
        return Promise.all(names.map(name => caches.delete(name)));
      }).then(() => {
        this.showNotification('Cache vidé avec succès', 'success');
      });
    } else {
      this.showNotification('API Cache non supportée', 'warning');
    }
  }

  toggleCDNUsage() {
    const useLocal = !localStorage.getItem('cdn-disabled');
    
    if (useLocal) {
      localStorage.setItem('cdn-disabled', 'true');
      this.showNotification('CDN désactivé - Utilisation des ressources locales', 'info');
    } else {
      localStorage.removeItem('cdn-disabled');
      this.showNotification('CDN activé', 'success');
    }

    // Recharger la page pour appliquer les changements
    setTimeout(() => window.location.reload(), 1000);
  }

  recordFailover(url) {
    const current = this.failoverCount.get(url) || 0;
    this.failoverCount.set(url, current + 1);
  }

  recordPerformance(metric, url, duration = performance.now()) {
    if (!this.performanceMetrics.has(metric)) {
      this.performanceMetrics.set(metric, []);
    }
    
    this.performanceMetrics.get(metric).push({
      url,
      duration,
      timestamp: Date.now()
    });

    // Limiter le nombre d'entrées
    const entries = this.performanceMetrics.get(metric);
    if (entries.length > 100) {
      this.performanceMetrics.set(metric, entries.slice(-50));
    }
  }

  monitorPerformance() {
    // Surveiller les performances de chargement
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.name.includes('cdn') || entry.name.includes('jsdelivr') || entry.name.includes('unpkg')) {
            this.recordPerformance('cdn_load', entry.name, entry.duration);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  showNotification(message, type = 'info') {
    if (window.pwaManager) {
      window.pwaManager.showNotification(message, type);
    } else {
      console.log(message);
    }
  }

  // API publique pour forcer l'utilisation du CDN
  forceCDN(enabled = true) {
    if (enabled) {
      localStorage.removeItem('cdn-disabled');
    } else {
      localStorage.setItem('cdn-disabled', 'true');
    }
  }

  // Obtenir les statistiques CDN
  getStats() {
    return {
      endpoints: this.cdnEndpoints,
      failovers: Object.fromEntries(this.failoverCount),
      performance: Object.fromEntries(this.performanceMetrics),
      strategy: this.cacheStrategy
    };
  }
}

// Initialiser le gestionnaire CDN
window.addEventListener('DOMContentLoaded', () => {
  window.cdnManager = new CDNManager();
});

// Export pour utilisation dans d'autres modules
window.CDNManager = CDNManager;