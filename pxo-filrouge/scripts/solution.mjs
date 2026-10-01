// Lance n'importe quelle commande avec PXO_SOLUTION=1, sous macOS, Linux et Windows.
//   node scripts/solution.mjs vitest run
// En mode solution, chaque import `@/…` cherche d'abord dans solutions/…, puis dans src/…
// (voir vite.config.ts et playwright.config.ts).
import { spawn } from 'node:child_process';

const [command, ...args] = process.argv.slice(2);
const child = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PXO_SOLUTION: '1' },
});
child.on('exit', (code) => process.exit(code ?? 1));
