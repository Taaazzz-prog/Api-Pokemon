/*
 * Gestionnaire de Lazy Loading pour les images
 * Ce fichier gère le chargement paresseux des images Pokémon
 */

class LazyLoadManager {
  constructor() {
    this.imageObserver = null;
    this.init();
  }

  init() {
    // Vérifier si IntersectionObserver est supporté
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        // Commencer à charger 100px avant que l'image soit visible
        rootMargin: '100px'
      });
    }
  }

  // Méthode pour observer une image
  observe(img) {
    if (!img) {
      return;
    }

    if (this.imageObserver) {
      try {
        this.imageObserver.observe(img);
      } catch (error) {
        this.loadImage(img);
      }
    } else {
      this.loadImage(img);
    }
  }

  // Méthode pour charger l'image
  loadImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      img.classList.add('loaded');
      
      // Supprimer data-src après chargement
      img.removeAttribute('data-src');
    }
  }

  isNearViewport(element, margin = 200) {
    if (!element || !element.isConnected) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    return (
      rect.bottom >= -margin &&
      rect.right >= -margin &&
      rect.top <= viewportHeight + margin &&
      rect.left <= viewportWidth + margin
    );
  }

  refresh() {
    if (!this.imageObserver) {
      document.querySelectorAll('img.lazy[data-src]').forEach(img => this.loadImage(img));
      return;
    }

    requestAnimationFrame(() => {
      document.querySelectorAll('img.lazy[data-src]').forEach(img => {
        if (!img.dataset.src) {
          return;
        }

        if (this.isNearViewport(img)) {
          this.loadImage(img);
        } else {
          try {
            this.imageObserver.observe(img);
          } catch (error) {
            this.loadImage(img);
          }
        }
      });
    });
  }

  // Méthode pour créer une image lazy
  createLazyImage(src, alt, className = '') {
    const img = document.createElement('img');
    img.alt = alt;
    img.className = `lazy ${className}`.trim();
    img.dataset.src = navigator.onLine ? src : './image/inconnu.png';

    // Image placeholder pendant le chargement
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';

    // Gestion d'erreur pour les images lazy
    img.onerror = function() {
      this.onerror = null;
      this.src = './image/inconnu.png';
      this.classList.add('error');
    };

    // Observer l'image pour le lazy loading
    this.observe(img);

    requestAnimationFrame(() => {
      if (img.dataset.src && this.isNearViewport(img)) {
        this.loadImage(img);
      }
    });

    return img;
  }

  // Méthode pour détruire l'observer (nettoyage)
  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
  }
}

// Instance globale du gestionnaire lazy loading
window.lazyLoadManager = new LazyLoadManager();
