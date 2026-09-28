// BONUS B3 — Threaded comments: a recursive type, a recursive Zod schema, recursive generics.
import * as z from 'zod';
import { todo } from '@/shared/todo';

export type CommentId = `cmt_${string}`;

export interface CommentNode {
  id: CommentId;
  author: string;
  text: string;
  replies: CommentNode[];
}

/**
 * TODO B3.1: the Zod twin of CommentNode (text: at least 1 character).
 * A schema cannot mention itself while it is being defined… unless through a getter:
 *   get replies() { return z.array(CommentSchema); }
 */
export const CommentSchema = z.any();

export const ThreadSchema = z.array(CommentSchema);

/**
 * TODO B3.2: make these generic. They must work for ANY tree whose nodes have `replies`
 * of their own type — CommentNode, a folder tree, a menu… — and keep the node type.
 * Hint: T extends { replies: readonly T[] }  (T appears in its own constraint).
 */
export function countNodes(nodes: readonly any[]): number {
  return todo('B3');
}

/** Depth-first, parents before their replies. Top-level nodes have depth 0. */
export function flattenTree(nodes: readonly any[]): { node: any; depth: number }[] {
  return todo('B3');
}
