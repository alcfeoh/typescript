// Mode de départ ou mode solution : quels fichiers une solution remplace.
//
// Dans src/, solutions/ et tests/, tous les imports passent par l'alias `@/`.
// En mode solution (PXO_SOLUTION=1), `@/chat/chat-bus` pointe vers
// solutions/chat/chat-bus.ts si ce fichier existe, et vers src/chat/chat-bus.ts sinon.
// Les tests suivent la même règle : solutions/tests/x.spec.ts remplace tests/x.spec.ts.
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

/** Les fichiers tests/… qui ont un équivalent dans solutions/tests/… (chemins POSIX, relatifs au projet). */
export function overriddenTests(): string[] {
  const solutionTests = join(root, 'solutions', 'tests');
  return listFiles(solutionTests).map((file) =>
    join('tests', relative(solutionTests, file)).split(sep).join('/'),
  );
}
