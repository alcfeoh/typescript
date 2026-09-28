import { defineConfig } from 'vitest/config';
import { isSolution, overriddenTests } from './build/overrides.ts';
import { exerciseResolver, fakeBackend, standardDecorators } from './build/plugins.ts';

// Starter mode by default. `npm run *:solution` sets PXO_SOLUTION=1 (see scripts/solution.mjs).
const testRoots = isSolution ? ['tests', 'solutions/tests'] : ['tests'];

export default defineConfig({
  plugins: [exerciseResolver(isSolution), standardDecorators(), fakeBackend()],
  server: { port: isSolution ? 5174 : 5173, strictPort: true },
  test: {
    // Runtime tests: *.spec.ts. Type-level tests: *.test-d.ts, checked by tsc (see `typecheck`).
    include: testRoots.map((dir) => `${dir}/**/*.spec.ts`),
    exclude: ['**/node_modules/**', ...(isSolution ? overriddenTests() : [])],
    environment: 'node',
    typecheck: {
      enabled: true,
      include: testRoots.map((dir) => `${dir}/**/*.test-d.ts`),
      exclude: ['**/node_modules/**', ...(isSolution ? overriddenTests() : [])],
      tsconfig: isSolution ? './solutions/tsconfig.json' : './tsconfig.json',
    },
  },
});
