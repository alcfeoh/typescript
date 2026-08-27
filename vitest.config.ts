import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Explicit imports from 'vitest' are used in every spec (no `globals: true`),
    // so no extra `types` entry is needed in tsconfig.json.
    include: ['tests/**/*.spec.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['app/**/*.ts'],
      exclude: ['app/main.ts', 'app/products-seed.ts'],
      reporter: ['text', 'html'],
    },
  },
});
