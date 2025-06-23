// Service Worker for offline support
const CACHE_NAME = 'workshop-2025-v1';
const urlsToCache = [
  '/workshop-2025/',
  '/workshop-2025/index.html',
  '/workshop-2025/common/styles.css',
  '/workshop-2025/workshop/index.html',
  '/workshop-2025/workshop/styles.css',
  '/workshop-2025/workshop/questions.js',
  '/workshop-2025/workshop/workshop.js',
  '/workshop-2025/workshop/export.js',
  '/workshop-2025/evaluation/index.html',
  '/workshop-2025/evaluation/styles.css',
  '/workshop-2025/evaluation/ideas-data.js',
  '/workshop-2025/evaluation/evaluation.js',
  '/workshop-2025/evaluation/results.js',
  '/workshop-2025/evaluation/charts.js',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache:', err);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/workshop-2025/index.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});