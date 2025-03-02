// client/public/sw.js
// This is a fallback service worker to ensure one exists at the root level

// Basic cache name
const CACHE_NAME = 'ongaku-music-v1';

// Assets to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install the service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate the service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => {
          return name !== CACHE_NAME;
        }).map((name) => {
          return caches.delete(name);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Setup Media Session API handlers
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INIT_MEDIA_SESSION') {
    const { track } = event.data;

    // Send message to confirm receipt
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'MEDIA_SESSION_INITIALIZED',
          success: true
        });
      });
    });
  }
});

// Handle Media Session API controls
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'MEDIA_SESSION_ACTION') {
    const { action } = event.data;

    // Forward action to client
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'MEDIA_CONTROL',
          action: action
        });
      });
    });
  }
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response as it can only be consumed once
        const responseClone = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            // Only cache successful responses
            if (response.status === 200) {
              cache.put(event.request, responseClone);
            }
          });

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
