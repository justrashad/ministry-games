import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base: './' keeps the production build portable (it can be opened from any folder or static host).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      // The app asks before updating so a new version never reloads mid-game.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Ministry Showdown',
        short_name: 'Showdown',
        description: 'A family-friendly survey guessing game designed for family worship.',
        theme_color: '#130d3d',
        background_color: '#0b0828',
        display: 'standalone',
        orientation: 'any',
        start_url: './#/',
        scope: './',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache everything the game needs, including fonts, so it runs with no connection.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2,webmanifest}'],
        // The share-preview image is only for link previews, not needed offline.
        globIgnores: ['**/og-image.png'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
  },
});
