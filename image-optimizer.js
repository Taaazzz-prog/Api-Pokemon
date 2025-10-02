class ImageOptimizer {
  constructor() {
    this.supportedFormats = {
      webp: this.supportsWebP(),
      avif: this.supportsAVIF()
    };
    this.compressionCache = new Map();
    this.init();
  }

  init() {
    this.setupImageObserver();
    this.optimizeExistingImages();
    this.createOptimizationInterface();
  }

  supportsWebP() {
    return new Promise((resolve) => {
      const webp = new Image();
      webp.onload = webp.onerror = () => {
        resolve(webp.height === 2);
      };
      webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  supportsAVIF() {
    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        resolve(avif.height === 2);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }

  setupImageObserver() {
    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.optimizeImage(entry.target);
        }
      });
    }, {
      rootMargin: '100px'
    });

    // Observer toutes les images
    this.observeImages();
  }

  observeImages() {
    const images = document.querySelectorAll('img[data-src], img:not([data-optimized])');
    images.forEach(img => {
      this.imageObserver.observe(img);
    });
  }

  async optimizeImage(img) {
    if (img.dataset.optimized) return;

    try {
      const originalSrc = img.src || img.dataset.src;
      if (!originalSrc) return;

      // Marquer comme en cours d'optimisation
      img.dataset.optimizing = 'true';

      // Essayer de charger une version optimisée
      const optimizedSrc = await this.getOptimizedImageSrc(originalSrc);
      
      if (optimizedSrc && optimizedSrc !== originalSrc) {
        // Précharger l'image optimisée
        const optimizedImg = new Image();
        optimizedImg.onload = () => {
          img.src = optimizedSrc;
          img.dataset.optimized = 'true';
          img.dataset.optimizing = 'false';
          this.addImageStats(img, originalSrc, optimizedSrc);
        };
        optimizedImg.onerror = () => {
          // Fallback vers l'image originale
          img.src = originalSrc;
          img.dataset.optimized = 'fallback';
          img.dataset.optimizing = 'false';
        };
        optimizedImg.src = optimizedSrc;
      } else {
        // Utiliser l'image originale
        img.src = originalSrc;
        img.dataset.optimized = 'original';
        img.dataset.optimizing = 'false';
      }

    } catch (error) {
      console.error('Erreur optimisation image:', error);
      img.dataset.optimizing = 'false';
      img.dataset.optimized = 'error';
    }
  }

  async getOptimizedImageSrc(originalSrc) {
    // Vérifier le cache
    if (this.compressionCache.has(originalSrc)) {
      return this.compressionCache.get(originalSrc);
    }

    try {
      // Pour les images Pokémon depuis l'API
      if (originalSrc.includes('pokebuildapi.fr') || originalSrc.includes('raw.githubusercontent.com')) {
        const optimizedSrc = await this.tryOptimizedFormats(originalSrc);
        this.compressionCache.set(originalSrc, optimizedSrc);
        return optimizedSrc;
      }

      // Pour les images locales
      if (originalSrc.startsWith('./') || originalSrc.startsWith('/') || !originalSrc.includes('://')) {
        const optimizedSrc = await this.tryLocalOptimizedFormats(originalSrc);
        this.compressionCache.set(originalSrc, optimizedSrc);
        return optimizedSrc;
      }

      return originalSrc;

    } catch (error) {
      console.error('Erreur génération image optimisée:', error);
      return originalSrc;
    }
  }

  async tryOptimizedFormats(originalSrc) {
    const formats = [];
    
    if (this.supportedFormats.avif) {
      formats.push(this.convertToFormat(originalSrc, 'avif'));
    }
    
    if (this.supportedFormats.webp) {
      formats.push(this.convertToFormat(originalSrc, 'webp'));
    }

    // Essayer chaque format dans l'ordre de préférence
    for (const formatSrc of formats) {
      if (await this.imageExists(formatSrc)) {
        return formatSrc;
      }
    }

    return originalSrc;
  }

  async tryLocalOptimizedFormats(originalSrc) {
    const basePath = originalSrc.replace(/\.[^/.]+$/, '');
    const formats = [];
    
    if (this.supportedFormats.avif) {
      formats.push(`${basePath}.avif`);
    }
    
    if (this.supportedFormats.webp) {
      formats.push(`${basePath}.webp`);
    }

    // Essayer chaque format
    for (const formatSrc of formats) {
      if (await this.imageExists(formatSrc)) {
        return formatSrc;
      }
    }

    return originalSrc;
  }

  convertToFormat(originalSrc, format) {
    // Pour l'API Pokémon, essayer des variations d'URL
    if (originalSrc.includes('pokebuildapi.fr')) {
      // L'API ne supporte probablement pas ces formats, retourner l'original
      return originalSrc;
    }

    // Pour GitHub ou autres CDN
    const extension = originalSrc.split('.').pop();
    return originalSrc.replace(`.${extension}`, `.${format}`);
  }

  async imageExists(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
      
      // Timeout après 3 secondes
      setTimeout(() => resolve(false), 3000);
    });
  }

  addImageStats(img, originalSrc, optimizedSrc) {
    // Ajouter des métadonnées pour le monitoring
    img.dataset.originalSrc = originalSrc;
    img.dataset.optimizedSrc = optimizedSrc;
    
    // Calculer les économies approximatives
    const originalExt = originalSrc.split('.').pop().toLowerCase();
    const optimizedExt = optimizedSrc.split('.').pop().toLowerCase();
    
    let estimatedSavings = 0;
    if (optimizedExt === 'avif') {
      estimatedSavings = originalExt === 'png' ? 70 : 50; // 70% pour PNG, 50% pour JPG
    } else if (optimizedExt === 'webp') {
      estimatedSavings = originalExt === 'png' ? 50 : 30; // 50% pour PNG, 30% pour JPG
    }
    
    img.dataset.estimatedSavings = estimatedSavings;
  }

  createOptimizationInterface() {
    // Bouton pour voir les statistiques d'optimisation
    const statsBtn = document.createElement('button');
    statsBtn.id = 'image-stats-btn';
    statsBtn.className = 'btn btn-secondary stats-btn';
    statsBtn.innerHTML = '📊 Stats Images';
    statsBtn.title = 'Voir les statistiques d\'optimisation des images';
    statsBtn.style.display = 'none'; // Masqué par défaut

    // Ajouter aux contrôles
    const controls = document.querySelector('.controls');
    if (controls) {
      controls.appendChild(statsBtn);
    }

    // Modal des statistiques
    const modal = document.createElement('div');
    modal.id = 'image-stats-modal';
    modal.className = 'modal stats-modal';
    modal.innerHTML = `
      <div class="modal-content stats-content">
        <div class="modal-header">
          <h2>📊 Statistiques d'Optimisation des Images</h2>
          <button class="modal-close" aria-label="Fermer">&times;</button>
        </div>
        
        <div class="stats-summary" id="stats-summary">
          <!-- Résumé généré dynamiquement -->
        </div>
        
        <div class="stats-details" id="stats-details">
          <!-- Détails générés dynamiquement -->
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Événements
    statsBtn.addEventListener('click', () => {
      this.showImageStats();
    });

    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.remove('active');
    });

    // Afficher le bouton après quelques optimisations
    setTimeout(() => {
      const optimizedImages = document.querySelectorAll('img[data-optimized="true"]');
      if (optimizedImages.length > 0) {
        statsBtn.style.display = 'block';
      }
    }, 5000);
  }

  showImageStats() {
    const modal = document.getElementById('image-stats-modal');
    modal.classList.add('active');
    this.renderStats();
  }

  renderStats() {
    const summary = document.getElementById('stats-summary');
    const details = document.getElementById('stats-details');

    const stats = this.calculateStats();

    // Résumé
    summary.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${stats.total}</div>
          <div class="stat-label">Images Total</div>
        </div>
        <div class="stat-card success">
          <div class="stat-number">${stats.optimized}</div>
          <div class="stat-label">Optimisées</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-number">${stats.fallback}</div>
          <div class="stat-label">Fallback</div>
        </div>
        <div class="stat-card info">
          <div class="stat-number">${stats.estimatedSavings}%</div>
          <div class="stat-label">Économies Est.</div>
        </div>
      </div>
      
      <div class="format-support">
        <h3>Support des Formats</h3>
        <div class="format-badges">
          <span class="format-badge ${this.supportedFormats.avif ? 'supported' : 'unsupported'}">
            AVIF ${this.supportedFormats.avif ? '✓' : '✗'}
          </span>
          <span class="format-badge ${this.supportedFormats.webp ? 'supported' : 'unsupported'}">
            WebP ${this.supportedFormats.webp ? '✓' : '✗'}
          </span>
        </div>
      </div>
    `;

    // Détails
    if (stats.details.length > 0) {
      details.innerHTML = `
        <h3>Détails par Image</h3>
        <div class="image-details-list">
          ${stats.details.map(detail => `
            <div class="image-detail-item">
              <img src="${detail.optimizedSrc}" alt="Preview" class="detail-preview">
              <div class="detail-info">
                <div class="detail-status ${detail.status}">${detail.statusText}</div>
                <div class="detail-format">Format: ${detail.format}</div>
                ${detail.savings > 0 ? `<div class="detail-savings">Économies: ~${detail.savings}%</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      details.innerHTML = '<p>Aucune donnée d\'optimisation disponible</p>';
    }
  }

  calculateStats() {
    const images = document.querySelectorAll('img[data-optimized]');
    const stats = {
      total: images.length,
      optimized: 0,
      fallback: 0,
      error: 0,
      estimatedSavings: 0,
      details: []
    };

    let totalSavings = 0;
    let savingsCount = 0;

    images.forEach(img => {
      const status = img.dataset.optimized;
      const savings = parseInt(img.dataset.estimatedSavings) || 0;

      switch (status) {
        case 'true':
          stats.optimized++;
          if (savings > 0) {
            totalSavings += savings;
            savingsCount++;
          }
          break;
        case 'fallback':
        case 'original':
          stats.fallback++;
          break;
        case 'error':
          stats.error++;
          break;
      }

      stats.details.push({
        src: img.src,
        originalSrc: img.dataset.originalSrc || img.src,
        optimizedSrc: img.dataset.optimizedSrc || img.src,
        status: status,
        statusText: this.getStatusText(status),
        format: this.getImageFormat(img.src),
        savings: savings
      });
    });

    stats.estimatedSavings = savingsCount > 0 ? Math.round(totalSavings / savingsCount) : 0;

    return stats;
  }

  // Alias pour la compatibilité avec test-features.html
  getOptimizationStats() {
    return this.calculateStats();
  }

  getStatusText(status) {
    switch (status) {
      case 'true': return 'Optimisée';
      case 'fallback': return 'Original';
      case 'original': return 'Non optimisée';
      case 'error': return 'Erreur';
      default: return 'Inconnu';
    }
  }

  getImageFormat(src) {
    const extension = src.split('.').pop().split('?')[0].toLowerCase();
    return extension.toUpperCase();
  }

  // Méthode pour forcer l'optimisation de toutes les images
  optimizeExistingImages() {
    setTimeout(() => {
      const images = document.querySelectorAll('img:not([data-optimized])');
      images.forEach(img => {
        this.imageObserver.observe(img);
      });
    }, 2000);
  }

  // Méthode pour réoptimiser toutes les images
  reoptimizeAll() {
    document.querySelectorAll('img[data-optimized]').forEach(img => {
      delete img.dataset.optimized;
      delete img.dataset.optimizing;
      this.optimizeImage(img);
    });
  }
}

// Initialiser l'optimiseur d'images
window.addEventListener('DOMContentLoaded', () => {
  window.imageOptimizer = new ImageOptimizer();
});

// Export pour utilisation dans d'autres modules
window.ImageOptimizer = ImageOptimizer;