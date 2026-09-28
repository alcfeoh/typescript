/**
 * B3 — comments — runtime test.
 * Run: npm run ex B3
 */
import { describe, expect, it } from 'vitest';
import { countNodes, flattenTree, ThreadSchema, type CommentNode } from '@/comments/comments';

describe('B3 — comments', () => {
  const thread: CommentNode[] = [
    {
      id: 'cmt_1',
      author: 'A',
      text: 'one',
      replies: [
        { id: 'cmt_2', author: 'B', text: 'two', replies: [{ id: 'cmt_3', author: 'C', text: 'three', replies: [] }] },
      ],
    },
    { id: 'cmt_4', author: 'D', text: 'four', replies: [] },
  ];

  it('validates a whole thread, at every depth', () => {
    expect(ThreadSchema.safeParse(thread).success).toBe(true);

    const deepError = structuredClone(thread);
    deepError[0]!.replies[0]!.replies[0]!.text = '';
    expect(ThreadSchema.safeParse(deepError).success).toBe(false);

    expect(ThreadSchema.safeParse([{ id: 'cmt_9', author: 'E', text: 'no replies field' }]).success).toBe(false);
  });

  it('counts the nodes at every depth', () => {
    expect(countNodes(thread)).toBe(4);
    expect(countNodes([])).toBe(0);
  });

  it('flattens depth-first, parents before their replies', () => {
    expect(flattenTree(thread).map(({ node, depth }) => `${depth}:${node.text}`)).toEqual([
      '0:one',
      '1:two',
      '2:three',
      '0:four',
    ]);
  });

  it('works on any tree with `replies` — not only comments', () => {
    const menu = [{ label: 'File', replies: [{ label: 'Open', replies: [] }] }];

    expect(flattenTree(menu).map(({ node }) => node.label)).toEqual(['File', 'Open']);
  });
});
