import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const REPO_NAME = 'Ayra_family_mart_final';

export default defineConfig(({ command }) => ({
  // In production (GitHub Pages) serve under /Ayra_family_mart_final/
  base: command === 'build' ? `/${REPO_NAME}/` : '/',
  plugins: [react()],
  resolve: {
    // Force a single copy of React in the monorepo — without this, npm workspace
    // hoisting can leave a React 18 stub in the root node_modules while client
    // has React 19, causing the "Invalid hook call" / duplicate-React crash.
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
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
}));
