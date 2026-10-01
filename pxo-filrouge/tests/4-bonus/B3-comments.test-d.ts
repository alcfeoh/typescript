/**
 * B3 — schéma récursif et arbres génériques — tests de types : vérifiés par tsc, jamais exécutés.
 * Lancer : npm run ex B3
 */
import { describe, expectTypeOf, it } from 'vitest';
import type * as z from 'zod';
import { flattenTree, type CommentNode, type CommentSchema } from '@/comments/comments';

describe('B3 — recursive schema & generic trees', () => {
  it('the schema outputs CommentNode', () => {
    expectTypeOf<z.output<typeof CommentSchema>>().toEqualTypeOf<CommentNode>();
  });

  it('flattenTree keeps the node type', () => {
    const menu = [{ label: 'File', replies: [] as { label: string; replies: never[] }[] }];
    expectTypeOf(flattenTree(menu)[0]!.node.label).toBeString();

    // @ts-expect-error — pas un arbre : pas de `replies`
    flattenTree([{ label: 'File' }]);
  });
});
