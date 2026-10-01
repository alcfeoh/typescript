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
  // Le getter retarde la référence : CommentSchema existe déjà quand Zod lit `replies`.
  get replies() {
    return z.array(CommentSchema);
  },
});

export const ThreadSchema = z.array(CommentSchema);

// Contrainte « F-bounded » : T apparaît dans sa propre contrainte. Tout type de nœud dont les réponses
// sont des nœuds du même type convient, et les fonctions conservent ce type exact.
type TreeNode<T> = { replies: readonly T[] };

export function countNodes<T extends TreeNode<T>>(nodes: readonly T[]): number {
  return nodes.reduce((total, node) => total + 1 + countNodes(node.replies), 0);
}

export function flattenTree<T extends TreeNode<T>>(nodes: readonly T[], depth = 0): { node: T; depth: number }[] {
  return nodes.flatMap((node) => [{ node, depth }, ...flattenTree(node.replies, depth + 1)]);
}
