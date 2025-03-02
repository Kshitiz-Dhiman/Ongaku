// client/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa'

const manifestForPlugin = {
    registerType: "autoUpdate",
    includeAssets: [
        'favicon.ico',
        'favicon.png',
        'favicon.svg',
        'apple-touch-icon.png'
    ],
    manifest: {
        name: "Ongaku Music",
        short_name: "Ongaku",
        description: "An app to listen music online",
        icons: [
            {
                src: "/android-chrome-192x192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png"
            },
            {
                src: "/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
                purpose: "apple touch icon"
            },
            {
                src: "/favicon-16x16.png",
                sizes: "16x16",
                type: "image/png"
            },
            {
                src: "/favicon-32x32.png",
                sizes: "32x32",
                type: "image/png"
            }
        ],
        theme_color: "#181818",
        background_color: "#0a1113",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
        categories: ["music", "entertainment"],
        screenshots: [],
        shortcuts: [],
        share_target: {
            action: "/share",
            method: "GET",
            params: {
                title: "title",
                text: "text",
                url: "url"
            }
        },
        // Add media session features
        media_session: {
            actions: [
                "play",
                "pause",
                "seekbackward",
                "seekforward",
                "previoustrack",
                "nexttrack"
            ]
        }
    },
    workbox: {
        sourcemap: true,
        swDest: 'dist/sw.js', // Make sure it's output to the correct location
        inlineWorkboxRuntime: true,
        // Add media session handling
        runtimeCaching: [
            {
                urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif)$/,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'images',
                    expiration: {
                        maxEntries: 60,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                    },
                },
            },
            {
                urlPattern: /\.mp3$/,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'audio',
                    expiration: {
                        maxEntries: 60,
                        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                    },
                    rangeRequests: true,
                },
            },
        ],
        strategies: 'injectManifest',
        injectManifest: {
            swSrc: './src/sw.js',
            swDest: 'sw.js',
            globDirectory: 'dist',
            maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        },
    }
};

export default defineConfig({
    plugins: [react(), tailwindcss(), VitePWA(manifestForPlugin)],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
