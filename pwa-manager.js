class PWAManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.installPrompt = null;
    this.swRegistration = null;
    this.init();
  }

  async init() {
    this.setupOnlineStatus();
    this.setupInstallPrompt();
    await this.registerServiceWorker();
    this.setupPWAFeatures();
    this.createInstallButton();
  }

  setupOnlineStatus() {
    // Indicateur de statut en ligne
    this.createOnlineIndicator();

    // Écouter les changements de statut
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateOnlineStatus();
      this.showNotification('🌐 Connexion rétablie', 'success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateOnlineStatus();
      this.showNotification('📱 Mode hors ligne activé', 'info');
    });
  }

  createOnlineIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'online-status';
    indicator.className = `online-indicator ${this.isOnline ? 'online' : 'offline'}`;
    indicator.innerHTML = `
      <span class="status-icon">${this.isOnline ? '🌐' : '📱'}</span>
      <span class="status-text">${this.isOnline ? 'En ligne' : 'Hors ligne'}</span>
    `;
    
    document.body.appendChild(indicator);
  }

  updateOnlineStatus() {
    const indicator = document.getElementById('online-status');
    if (indicator) {
      indicator.className = `online-indicator ${this.isOnline ? 'online' : 'offline'}`;
      indicator.innerHTML = `
        <span class="status-icon">${this.isOnline ? '🌐' : '📱'}</span>
        <span class="status-text">${this.isOnline ? 'En ligne' : 'Hors ligne'}</span>
      `;
    }
  }

  setupInstallPrompt() {
    // Capturer l'événement d'installation
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.showInstallButton();
    });

    // Gérer l'installation réussie
    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.hideInstallButton();
      this.showNotification('🎉 Application installée avec succès !', 'success');
    });
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });

        console.log('✅ Service Worker enregistré:', this.swRegistration.scope);

        // Écouter les mises à jour
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });

        // Écouter les messages du Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'CACHE_UPDATED') {
            this.showNotification('📦 Contenu mis en cache', 'info');
          }
        });

      } catch (error) {
        console.error('❌ Erreur d\'enregistrement du Service Worker:', error);
      }
    }
  }

  setupPWAFeatures() {
    // Gérer les paramètres d'URL pour les raccourcis
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('action') === 'search') {
      // Ouvrir la recherche avancée
      setTimeout(() => {
        if (window.advancedSearchManager) {
          window.advancedSearchManager.toggleSearch();
        }
      }, 1000);
    }
    
    if (urlParams.get('action') === 'favorites') {
      // Ouvrir les favoris
      setTimeout(() => {
        if (window.favoritesManager) {
          window.favoritesManager.openModal();
        }
      }, 1000);
    }

    if (urlParams.get('generation')) {
      // Filtrer par génération
      const generation = urlParams.get('generation');
      setTimeout(() => {
        if (window.advancedSearchManager) {
          window.advancedSearchManager.setGeneration(generation);
        }
      }, 1000);
    }

    // Gérer le partage
    if ('share' in navigator) {
      this.setupSharingFeature();
    }
  }

  createInstallButton() {
    const installBtn = document.createElement('button');
    installBtn.id = 'install-app-btn';
    installBtn.className = 'btn install-btn hidden';
    installBtn.innerHTML = '📱 Installer l\'app';
    installBtn.addEventListener('click', () => this.installApp());
    
    // Ajouter à la zone de contrôles
    const controls = document.querySelector('.controls');
    if (controls) {
      controls.appendChild(installBtn);
    }
  }

  showInstallButton() {
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) {
      installBtn.classList.remove('hidden');
    }
  }

  hideInstallButton() {
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) {
      installBtn.classList.add('hidden');
    }
  }

  async installApp() {
    if (!this.installPrompt) return;

    try {
      const result = await this.installPrompt.prompt();
      console.log('Résultat de l\'installation:', result.outcome);
      
      this.installPrompt = null;
      this.hideInstallButton();
      
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
    }
  }

  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <span>🆕 Une nouvelle version est disponible</span>
        <button class="btn btn-small" onclick="window.pwaManager.updateApp()">
          Mettre à jour
        </button>
        <button class="btn btn-small btn-secondary" onclick="this.parentElement.parentElement.remove()">
          Plus tard
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Retirer automatiquement après 10 secondes
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  async updateApp() {
    if (this.swRegistration && this.swRegistration.waiting) {
      // Dire au Service Worker d'activer immédiatement
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recharger la page pour utiliser la nouvelle version
      window.location.reload();
    }
  }

  setupSharingFeature() {
    // Ajouter un bouton de partage pour les Pokémons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('share-pokemon')) {
        const pokemonData = JSON.parse(e.target.dataset.pokemon);
        this.sharePokemon(pokemonData);
      }
    });
  }

  async sharePokemon(pokemon) {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: `${pokemon.name} - Pokédex`,
          text: `Découvrez ${pokemon.name}, un Pokémon de type ${pokemon.apiTypes.map(t => t.name).join('/')}`,
          url: `${window.location.origin}/?pokemon=${pokemon.pokedexId}`
        });
      } catch (error) {
        // Fallback vers le presse-papiers
        this.copyToClipboard(`${pokemon.name} - ${window.location.origin}/?pokemon=${pokemon.pokedexId}`);
      }
    }
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showNotification('📋 Lien copié !', 'success');
    } catch (error) {
      console.error('Erreur de copie:', error);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `pwa-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animation d'apparition
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Retirer après 3 secondes
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Méthodes utilitaires pour les autres composants
  async getCacheInfo() {
    if (!this.swRegistration) return null;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      this.swRegistration.active?.postMessage(
        { type: 'GET_CACHE_INFO' },
        [messageChannel.port2]
      );
    });
  }

  async clearCache() {
    if (!this.swRegistration) return false;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      this.swRegistration.active?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  // Vérifier si l'app est installée
  isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           window.navigator.standalone === true;
  }
}

// Initialiser le gestionnaire PWA
window.addEventListener('load', () => {
  window.pwaManager = new PWAManager();
});

// Export pour utilisation dans d'autres modules
window.PWAManager = PWAManager;