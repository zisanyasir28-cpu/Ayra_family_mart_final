/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const REPO_NAME = 'Ayra_family_mart_final';

export default defineConfig(({ command }) => ({
  // In production (GitHub Pages) serve under /Ayra_family_mart_final/
  base: command === 'build' ? `/${REPO_NAME}/` : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'offline.html'],
      manifest: {
        name:             'Ayra Family Mart',
        short_name:       'Ayra',
        description:      'Bangladesh online superstore — fresh groceries, daily essentials, fast delivery.',
        theme_color:      '#16a34a',
        background_color: '#0a0a0a',
        display:          'standalone',
        orientation:      'portrait',
        scope:            command === 'build' ? `/${REPO_NAME}/` : '/',
        start_url:        command === 'build' ? `/${REPO_NAME}/` : '/',
        icons: [
          { src: 'icons/icon-192.png',          sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png',          sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Avoid catching API or admin routes — only customer SPA navigation falls back to offline
        navigateFallback:        'offline.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/admin\//],
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*\.(?:png|jpg|jpeg|webp|avif|svg)$/i,
            handler:     'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/api\/v1\/products(\?.*)?$/,
            handler:     'StaleWhileRevalidate',
            options: {
              cacheName: 'api-products',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }, // 5 min
            },
          },
          {
            urlPattern: /\/api\/v1\/categories$/,
            handler:     'StaleWhileRevalidate',
            options: {
              cacheName: 'api-categories',
              expiration: { maxAgeSeconds: 60 * 10 }, // 10 min
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // disable in dev to avoid stale-cache headaches
      },
    }),
  ],
  resolve: {
    // Force a single copy of React in the monorepo — root package.json
    // declares an `overrides` block pinning react/react-dom to 19.x, so this
    // dedupe is sufficient.
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@superstore/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals:     true,
    setupFiles:  ['./src/tests/setup.ts'],
    css:         false,
    // Force a single React instance — otherwise hoisted React 18 in the
    // monorepo root conflicts with client's React 19 in tests.
    server: {
      deps: { inline: [/^react/, /^@testing-library/] },
    },
  },
}));
