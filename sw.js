const CACHE_NAME = 'budget-tracker-v3';
const STATIC_CACHE_NAME = 'budget-tracker-static-v2';
const RUNTIME_CACHE_NAME = 'budget-tracker-runtime-v2';

const staticAssets = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icons/icon-192x192.svg',
  './icons/icon-512x512.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Numans&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install a service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Pre-caching static assets');
        return cache.addAll(staticAssets);
      })
  );
  self.skipWaiting(); // Immediately take control
});

// Cache and return requests
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Define strategies for different types of requests
  const { request } = event;
  const url = new URL(request.url);
  
  // For static assets, use cache-first strategy
  if (url.origin === location.origin) {
    // Cache-first strategy for static assets
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          // If not in cache, fetch and cache
          return fetch(request).then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            
            return networkResponse;
          });
        })
    );
  } else {
    // Network-first strategy for external resources (fonts, icons, etc.)
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          const networkFetch = fetch(request)
            .then((networkResponse) => {
              // Only cache successful responses
              if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                const responseToCache = networkResponse.clone();
                caches.open(RUNTIME_CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseToCache);
                  });
              }
              return networkResponse;
            })
            .catch(() => {
              // If network fails, return cached response
              return cachedResponse;
            });
          
          return cachedResponse || networkFetch;
        })
    );
  }
});

// Update a service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== RUNTIME_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients
});
