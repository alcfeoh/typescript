// BONUS B3 — Commentaires en fil de discussion : un type récursif, un schéma Zod récursif, des génériques récursifs.
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
 * TODO B3.1 : le jumeau Zod de CommentNode (text : au moins 1 caractère).
 * Un schéma ne peut pas se citer lui-même pendant qu'on l'écrit… sauf dans un getter :
 *   get replies() { return z.array(CommentSchema); }
 */
export const CommentSchema = z.any();

export const ThreadSchema = z.array(CommentSchema);

/**
 * TODO B3.2 : rendez ces fonctions génériques. Elles doivent marcher pour N'IMPORTE QUEL arbre dont les nœuds
 * ont des `replies` de leur propre type — CommentNode, une arborescence de dossiers, un menu… — et garder le type du nœud.
 * Indice : T extends { replies: readonly T[] }  (T apparaît dans sa propre contrainte).
 */
export function countNodes(nodes: readonly any[]): number {
  return todo('B3');
}

/** En profondeur d'abord, chaque parent avant ses réponses. Les nœuds du premier niveau ont la profondeur 0. */
export function flattenTree(nodes: readonly any[]): { node: any; depth: number }[] {
  return todo('B3');
}
