/**
 * B3 — recursive schema & generic trees — type-level test: checked by tsc, never executed.
 * Run: npm run ex B3
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

    // @ts-expect-error — not a tree: no `replies`
    flattenTree([{ label: 'File' }]);
  });
});
