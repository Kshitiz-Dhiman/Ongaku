// client/src/sw.js

// Import Workbox libraries
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache assets from the Vite build process
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache images with a Cache First strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache API responses with a Stale While Revalidate strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/song') ||
               url.pathname.startsWith('/album') ||
               url.pathname.startsWith('/search') ||
               url.pathname.startsWith('/get'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 hour
      }),
    ],
  })
);

// Setup Media Session API handlers when controlled by this service worker
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

// Handle Media Session API controls from the OS/browser
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

// Activate the service worker immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Background fetch support for downloading songs (if you implement this feature)
self.addEventListener('backgroundfetchsuccess', (event) => {
  const bgFetch = event.registration;

  event.waitUntil(async function() {
    const records = await bgFetch.matchAll();

    const promises = records.map(async (record) => {
      const response = await record.responseReady;
      const cache = await caches.open('audio-cache');
      await cache.put(record.request, response);
    });

    await Promise.all(promises);

    // Notify client that download is complete
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({
        type: 'BACKGROUND_FETCH_COMPLETE',
        id: bgFetch.id
      });
    }
  }());
});
