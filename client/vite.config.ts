/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const REPO_NAME = 'Ayra_family_mart_final';

export default defineConfig(() => {
  // GitHub Pages preview builds set VITE_BASE_PATH=/Ayra_family_mart_final/
  // Vercel (production) leaves it unset → base is always '/'
  const base = process.env.VITE_BASE_PATH ?? '/';

  return {
    base,
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
        scope:            base,
        start_url:        base,
        icons: [
          { src: 'icons/icon-192.png',          sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png',          sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // SPA fallback: serve the app shell for any navigation the SW can't match.
        // Using index.html (not offline.html) prevents false "You're offline" screens
        // caused by transient SW state during autoUpdate takeovers.
        // The app handles its own offline/error UI via React Query error states.
        navigateFallback:        '/index.html',
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
        // Dev + Claude preview talk to the LIVE Railway backend so we always see
        // real data (433 products) instead of demo fallbacks. changeOrigin lets
        // Railway accept the proxied request (server-to-server → no browser Origin,
        // so CORS allows it); cookieDomainRewrite rebinds the httpOnly auth cookie
        // to localhost so login/cart work too. Point back at http://localhost:5000
        // if you ever run the backend locally.
        target: 'https://ayrafamilymartfinal-production.up.railway.app',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split only the EAGER vendor libs (already in the first-load entry) into
        // their own long-cached chunks. This shrinks the entry and lets the
        // browser keep React et al. cached across deploys.
        //
        // Do NOT manual-chunk libraries used only by lazy routes (recharts,
        // react-hook-form, date-fns): Vite modulepreloads named manual chunks,
        // so forcing a lazy-only lib into one would pull it into the first-load.
        // Left alone, those stay inside their route chunks and load on demand.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react-vendor';
          if (id.includes('@tanstack')) return 'tanstack';
          if (/[\\/]node_modules[\\/]motion[\\/]/.test(id) || id.includes('framer-motion')) return 'motion';
          if (id.includes('lucide-react')) return 'icons';
          return undefined;
        },
      },
    },
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
  };
});
