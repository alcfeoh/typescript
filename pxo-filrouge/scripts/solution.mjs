// Runs any command with PXO_SOLUTION=1, on macOS, Linux and Windows alike.
//   node scripts/solution.mjs vitest run
// In solution mode, every `@/…` import resolves to solutions/… first, then src/…
// (see vite.config.ts and playwright.config.ts).
import { spawn } from 'node:child_process';

const [command, ...args] = process.argv.slice(2);
const child = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PXO_SOLUTION: '1' },
});
child.on('exit', (code) => process.exit(code ?? 1));
