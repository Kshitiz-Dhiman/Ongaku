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
