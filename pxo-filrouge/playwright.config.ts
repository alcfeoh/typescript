import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { isSolution, overriddenTests, root } from './build/overrides.ts';

// Starter mode: tests/e2e/*.e2e.ts against the starter app (port 5173).
// Solution mode (`npm run e2e:solution`): solution specs against the solution app (port 5174).
const port = isSolution ? 5174 : 5173;

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.e2e.ts',
  testIgnore: [
    '**/node_modules/**',
    ...(isSolution ? overriddenTests().map((file) => join(root, file)) : ['**/solutions/**']),
  ],
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: isSolution ? 'node scripts/solution.mjs vite' : 'vite',
    port,
    reuseExistingServer: true,
  },
});
