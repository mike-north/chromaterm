import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'test/', 'test-d/', '**/*.test.ts', '**/*.config.ts'],
    },
    snapshotFormat: {
      printBasicPrototype: false,
    },
  },
});
