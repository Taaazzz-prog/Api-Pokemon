// Service Worker pour les fonctionnalités PWA
const CACHE_NAME = 'pokemon-app-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/asyncAwait.js',
  '/mobile-menu.js',
  '/lazy-load.js',
  '/pagination.js',
  '/theme-manager.js',
  '/favorites.js',
  '/advanced-search.js',
  '/accessibility.js',
  // Images essentielles
  '/image/logo.png',
  '/image/pokeball.png',
  '/image/background.gif',
  '/image/inconnu.png',
  // Logos de types
  '/logo/Bug.webp',
  '/logo/Dark.webp',
  '/logo/Dragon.webp',
  '/logo/Electric.webp',
  '/logo/Fairy.webp',
  '/logo/Fighting.webp',
  '/logo/Fire.webp',
  '/logo/Flying.webp',
  '/logo/Ghost.webp',
  '/logo/Grass.webp',
  '/logo/Ground.webp',
  '/logo/Ice.webp',
  '/logo/Normal.webp',
  '/logo/Poison.webp',
  '/logo/Psychic.webp',
  '/logo/Rock.webp',
  '/logo/Steel.webp',
  '/logo/Water.webp'
];

const API_CACHE_NAME = 'pokemon-api-v1.0.0';
const API_URLS = [
  'https://pokebuildapi.fr/api/v1/pokemon',
  'https://pokebuildapi.fr/api/v1/pokemon/limit/1000'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation en cours...');
  
  event.waitUntil(
    Promise.all([
      // Cache des ressources statiques
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 Cache des ressources statiques...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Pré-cache de l'API
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('🌐 Pré-cache de l\'API...');
        return Promise.allSettled(
          API_URLS.map(url => 
            fetch(url)
              .then(response => response.ok ? cache.put(url, response) : null)
              .catch(err => console.warn(`Impossible de mettre en cache ${url}:`, err))
          )
        );
      })
    ]).then(() => {
      console.log('✅ Service Worker: Installation terminée');
      return self.skipWaiting();
    })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activation en cours...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer les anciens caches
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('🗑️ Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation terminée');
      return self.clients.claim();
    })
  );
});

// Stratégie de mise en cache
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers d'autres domaines (sauf l'API Pokémon)
  if (url.origin !== location.origin && !url.hostname.includes('pokebuildapi.fr')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    // Stratégie pour l'API Pokémon
    if (url.hostname.includes('pokebuildapi.fr')) {
      return await handleApiRequest(request);
    }

    // Stratégie pour les images Pokémon
    if (url.pathname.includes('/pokemon_images/')) {
      return await handleImageRequest(request);
    }

    // Stratégie pour les ressources statiques
    return await handleStaticRequest(request);

  } catch (error) {
    console.error('Erreur dans le Service Worker:', error);
    return await handleFallback(request);
  }
}

// Gestion des requêtes API (Network First avec cache)
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);

  try {
    // Essayer le réseau en premier
    const networkResponse = await fetch(request, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (networkResponse.ok) {
      // Mettre en cache la réponse réseau
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Réponse réseau invalide');

  } catch (error) {
    console.log('🔄 API hors ligne, utilisation du cache pour:', request.url);
    
    // Fallback sur le cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Réponse d'erreur si pas de cache
    return new Response(
      JSON.stringify({
        error: 'Données non disponibles hors ligne',
        message: 'Veuillez vérifier votre connexion internet'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Gestion des images (Cache First avec mise à jour en arrière-plan)
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Vérifier d'abord le cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Mise à jour en arrière-plan
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response);
      }
    }).catch(() => {
      // Ignorer les erreurs de mise à jour
    });
    
    return cachedResponse;
  }

  try {
    // Si pas en cache, récupérer du réseau
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Image non disponible');
    
  } catch (error) {
    // Fallback vers l'image par défaut
    const fallbackImage = await cache.match('/image/inconnu.png');
    return fallbackImage || new Response('', { status: 404 });
  }
}

// Gestion des ressources statiques (Cache First)
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Vérifier d'abord le cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Si pas en cache, récupérer du réseau
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    return await handleFallback(request);
  }
}

// Gestion des fallbacks
async function handleFallback(request) {
  const url = new URL(request.url);
  
  // Fallback pour les pages HTML
  if (request.destination === 'document') {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match('/index.html') || 
           new Response('Page non disponible hors ligne', { status: 503 });
  }

  // Fallback pour les images
  if (request.destination === 'image') {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match('/image/inconnu.png') || 
           new Response('', { status: 404 });
  }

  return new Response('Ressource non disponible', { status: 404 });
}

// Gestion des messages du thread principal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    getCacheInfo().then(info => {
      event.ports[0].postMessage(info);
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Informations sur le cache
async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const info = {
    caches: [],
    totalSize: 0
  };

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    let cacheSize = 0;
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        cacheSize += blob.size;
      }
    }

    info.caches.push({
      name: cacheName,
      entries: keys.length,
      size: cacheSize
    });
    
    info.totalSize += cacheSize;
  }

  return info;
}

// Nettoyer tous les caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}