const CACHE_VERSION = 'controle-financeiro-v2-' + new Date().getTime();

// Install: Just activate, don't try to cache specific URLs
self.addEventListener('install', (event) => {
  console.log('Service Worker installing, cache version:', CACHE_VERSION);
  self.skipWaiting();
});

// Activate: Clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('Found caches:', cacheNames);
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone and cache successful responses
        const responseToCache = response.clone();
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Return cached version if available
        return caches.match(event.request);
      })
  );
});
