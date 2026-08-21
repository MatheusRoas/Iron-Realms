// Iron Realms — Service Worker
// Cacheia todos os assets na primeira visita para funcionamento offline.

const CACHE_NAME = 'iron-realms-v1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './lang/pt-br.js',
  './lang/es-es.js',
  './src/i18n.js',
  './src/game-foundation.js',
  './src/game-data.js',
  './src/game-state.js',
  './src/game-render.js',
  './src/game-actions.js',
  './assets/closednotf.png',
  './assets/notf.png',
  './assets/resource-food.png',
  './assets/resource-gold.png',
  './assets/resource-iron.png',
  './assets/resource-stone.png',
  './assets/resource-wood.png',
  './assets/location-castle.jpg',
  './assets/location-ruins.jpg',
  './assets/location-village.jpg',
  './assets/terrain-forest.jpg',
  './assets/terrain-hill.jpg',
  './assets/terrain-mountain.jpg',
  './assets/terrain-plains.jpg',
  './assets/terrain-river.jpg',
  './assets/world-map.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }

        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
