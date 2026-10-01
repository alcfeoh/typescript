// Lance les tests d'UN exercice. Chaque exercice a ses propres fichiers de tests, nommés d'après lui :
// tests/2-chat/C3-batch.test-d.ts, tests/1-account/A1-signup-schema.spec.ts, …
//
//   npm run ex A1        → Vitest en mode watch : tests d'exécution + tests de types de A1, relancés à chaque sauvegarde
//   npm run ex:once A1   → la même chose, une seule fois
//   npm run ex T2        → Playwright (T2, M5) : tests/e2e/T2-login.e2e.ts, une seule fois
//
// Fonctionne sous macOS, Linux et Windows.
import { spawn } from 'node:child_process';

const VITEST_STEPS = ['T1', 'A1', 'A2', 'A3', 'A4', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'M1', 'M2', 'M3', 'M4', 'B1', 'B2', 'B3'];
const PLAYWRIGHT_STEPS = ['T2', 'M5'];

const args = process.argv.slice(2);
const once = args.includes('--once');
const step = args.find((arg) => !arg.startsWith('--'))?.toUpperCase();

function run(command, commandArgs) {
  const child = spawn(command, commandArgs, { stdio: 'inherit', shell: true });
  child.on('exit', (code) => process.exit(code ?? 1));
}

// Les deux outils acceptent un filtre sur le nom de fichier : "A1-" trouve A1-signup-schema.spec.ts et .test-d.ts.
const filter = (s) => (s === 'T1' ? 'typing-indicator' : `${s}-`);

if (step && VITEST_STEPS.includes(step)) {
  run('npx', ['vitest', once ? 'run' : 'watch', filter(step)]);
} else if (step && PLAYWRIGHT_STEPS.includes(step)) {
  run('npx', ['playwright', 'test', filter(step)]); // Playwright n'a pas de mode watch : voir npm run e2e:ui
} else {
  console.error('Usage: npm run ex <step>        (watch mode)');
  console.error('       npm run ex:once <step>   (run once)');
  console.error(`Steps: ${[...VITEST_STEPS, ...PLAYWRIGHT_STEPS].join(', ')}`);
  process.exit(1);
}
