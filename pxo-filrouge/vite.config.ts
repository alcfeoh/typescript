import { defineConfig } from 'vitest/config';
import { isSolution, overriddenTests } from './build/overrides.ts';
import { exerciseResolver, fakeBackend, standardDecorators } from './build/plugins.ts';

// Mode de départ par défaut. `npm run *:solution` définit PXO_SOLUTION=1 (voir scripts/solution.mjs).
const testRoots = isSolution ? ['tests', 'solutions/tests'] : ['tests'];

export default defineConfig({
  plugins: [exerciseResolver(isSolution), standardDecorators(), fakeBackend()],
  server: { port: isSolution ? 5174 : 5173, strictPort: true },
  test: {
    // Tests d'exécution : *.spec.ts. Tests de types : *.test-d.ts, vérifiés par tsc (voir `typecheck`).
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
