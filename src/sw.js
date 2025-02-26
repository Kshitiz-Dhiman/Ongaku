import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Take control immediately
clientsClaim();
self.skipWaiting();

// Precache and route all static assets
precacheAndRoute(self.__WB_MANIFEST || []);

// Handle Media Session API
self.addEventListener('message', (event) => {
    if (event.data.type === 'MEDIA_SESSION_UPDATE') {
        const { metadata, playbackState } = event.data;

        if ('mediaSession' in navigator) {
            try {
                // Set media metadata
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: metadata.title || 'Unknown Title',
                    artist: metadata.artist || 'Unknown Artist',
                    album: metadata.album || 'Unknown Album',
                    artwork: metadata.artwork || []
                });

                // Update playback state
                navigator.mediaSession.playbackState = playbackState;

                // Set action handlers
                navigator.mediaSession.setActionHandler('play', metadata.onPlay);
                navigator.mediaSession.setActionHandler('pause', metadata.onPause);
                navigator.mediaSession.setActionHandler('previoustrack', metadata.onPreviousTrack);
                navigator.mediaSession.setActionHandler('nexttrack', metadata.onNextTrack);

                // Set seek handlers if duration is available
                if (metadata.duration) {
                    navigator.mediaSession.setActionHandler('seekto', metadata.onSeekTo);
                    navigator.mediaSession.setActionHandler('seekbackward', metadata.onSeekBackward);
                    navigator.mediaSession.setActionHandler('seekforward', metadata.onSeekForward);
                }
            } catch (error) {
                console.error('Media Session API error:', error);
            }
        }
    }
});

// Cache static assets
registerRoute(
    ({ request }) => request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'font',
    new StaleWhileRevalidate({
        cacheName: 'static-resources',
    })
);

// Cache images from Saavn CDN
registerRoute(
    ({ url }) => url.origin === 'https://c.saavncdn.com',
    new CacheFirst({
        cacheName: 'image-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
        ],
    })
);

// Cache audio files
registerRoute(
    ({ url }) => url.pathname.includes('/song'),
    new NetworkFirst({
        cacheName: 'audio-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
            }),
        ],
    })
);

// Handle navigation requests
registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
        cacheName: 'navigations',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 32,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
            }),
        ],
    })
);

// Handle offline fallback
const fallbackResponse = Response.error();
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => fallbackResponse)
    );
});
