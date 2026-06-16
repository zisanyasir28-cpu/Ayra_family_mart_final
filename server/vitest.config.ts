import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Only run the TypeScript source tests. Without this, a prior `tsc` build
    // leaves compiled copies in dist/tests/*.test.js that vitest also picks up
    // — they fail because compiled CommonJS can't `require` vitest.
    include: ['src/**/*.{test,spec}.ts'],
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
