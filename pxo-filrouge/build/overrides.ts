// Starter vs solution: which files a solution replaces.
//
// Every import inside src/, solutions/ and tests/ goes through the `@/` alias.
// In solution mode (PXO_SOLUTION=1), `@/chat/chat-bus` resolves to
// solutions/chat/chat-bus.ts when that file exists, and to src/chat/chat-bus.ts otherwise.
// Test files work the same way: solutions/tests/x.spec.ts replaces tests/x.spec.ts.
import { existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('..', import.meta.url));
export const isSolution = process.env.PXO_SOLUTION === '1';

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

/** tests/… files that have a counterpart in solutions/tests/… (POSIX paths, relative to the project). */
export function overriddenTests(): string[] {
  const solutionTests = join(root, 'solutions', 'tests');
  return listFiles(solutionTests).map((file) =>
    join('tests', relative(solutionTests, file)).split(sep).join('/'),
  );
}
