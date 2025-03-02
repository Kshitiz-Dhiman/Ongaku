// client/workbox-config.js
module.exports = {
  globDirectory: "dist/",
  globPatterns: [
    "**/*.{js,css,html,ico,png,jpg,jpeg,svg,json}"
  ],
  swDest: "dist/sw.js",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
        }
      }
    },
    {
      urlPattern: /\.mp3$/,
      handler: "CacheFirst",
      options: {
        cacheName: "audio",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 Days
        },
        rangeRequests: true
      }
    },
    {
      urlPattern: new RegExp('/song|/album|/search|/get'),
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 // 1 hour
        }
      }
    }
  ],
  skipWaiting: true,
  clientsClaim: true
};
