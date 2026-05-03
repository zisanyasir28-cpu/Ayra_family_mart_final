import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/controllers/**', 'src/utils/**'],
    },
  },
  resolve: {
    alias: {
      '@superstore/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
});
