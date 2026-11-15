import { env } from 'node:process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { titleFor } from './titles.config';

// One title is built at a time. TITLE picks it; with none set, Ministry Showdown is built.
const title = titleFor(env.TITLE);
const titleDir = fileURLToPath(new URL(`./src/games/${title.id}`, import.meta.url));

// base: './' keeps the production build portable (it can be opened from any folder or static host).
export default defineConfig({
  base: './',
  publicDir: `${titleDir}/public`,
  resolve: {
    alias: { '@title': titleDir },
  },
  define: {
    __TITLE__: JSON.stringify(title),
  },
  plugins: [
    react(),
    VitePWA({
      // The app asks before updating so a new version never reloads mid-game.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: title.name,
        short_name: title.shortName,
        description: title.description,
        theme_color: title.themeColor,
        background_color: title.backgroundColor,
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
