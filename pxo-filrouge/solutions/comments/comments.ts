// Solution — B3.
import * as z from 'zod';

export type CommentId = `cmt_${string}`;

export interface CommentNode {
  id: CommentId;
  author: string;
  text: string;
  replies: CommentNode[];
}

export const CommentSchema = z.object({
  id: z.templateLiteral(['cmt_', z.string()]),
  author: z.string(),
  text: z.string().min(1),
  // The getter delays the reference: CommentSchema exists by the time Zod reads `replies`.
  get replies() {
    return z.array(CommentSchema);
  },
});

export const ThreadSchema = z.array(CommentSchema);

// "F-bounded" constraint: T appears in its own bound. Any node type whose replies are
// nodes of the same type qualifies, and the functions keep that exact type.
type TreeNode<T> = { replies: readonly T[] };

export function countNodes<T extends TreeNode<T>>(nodes: readonly T[]): number {
  return nodes.reduce((total, node) => total + 1 + countNodes(node.replies), 0);
}

export function flattenTree<T extends TreeNode<T>>(nodes: readonly T[], depth = 0): { node: T; depth: number }[] {
  return nodes.flatMap((node) => [{ node, depth }, ...flattenTree(node.replies, depth + 1)]);
}
