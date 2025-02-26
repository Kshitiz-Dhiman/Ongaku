import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/

const manifestForPlugin = {
    registerType: "prompt",
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
        orientation: "portrait"
    },
    strategies: 'generateSW', // Changed from 'injectManifest'
    srcDir: 'src',
    filename: 'sw.js',
    injectRegister: 'auto',
    workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,mp3}'],
        runtimeCaching: [
            {
                urlPattern: /^https:\/\/c\.saavncdn\.com/,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'image-cache',
                    expiration: {
                        maxEntries: 100,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                    },
                },
            },
            {
                urlPattern: /\/song\?id=/,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'audio-cache',
                    expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    },
                },
            },
        ],
        // Add media session support
        navigationPreload: true,
        cleanupOutdatedCaches: true,
        sourcemap: true,
        injectManifest: {
            injectionPoint: null
        }
    },
    // Add Media Session API support
    injectManifest: {
        injectionPoint: null,
        swSrc: 'src/sw.js',
        swDest: 'dist/sw.js',
        additionalManifestEntries: [],
        rollupFormat: 'iife',
    }
};

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            strategies: 'generateSW',
            registerType: 'autoUpdate',
            filename: 'sw.js',
            manifestFilename: 'manifest.json',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,mp3}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/c\.saavncdn\.com/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 30 * 24 * 60 * 60,
                            },
                        },
                    },
                    {
                        urlPattern: /\/song\?id=/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'audio-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 24 * 60 * 60,
                            },
                        },
                    },
                ],
                navigationPreload: true,
                cleanupOutdatedCaches: true,
            },
            devOptions: {
                enabled: true,
                type: 'module'
            }
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        headers: {
            'Service-Worker-Allowed': '/'
        }
    }
})
