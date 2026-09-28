// BONUS B1 — a generic, type-safe search used by the country picker of the sign-up form.
import { todo } from '@/shared/todo';

/**
 * The keys of T whose value is a string.
 * KeysMatching<{ code: 'FR'; name: string; population: number }, string> → 'code' | 'name'
 */
export type KeysMatching<T, V> = any; // TODO B1

/**
 * Case- and accent-insensitive "contains" search on ONE string property of the items.
 *   searchBy(COUNTRIES, 'name', 'suis')        ✅ → [Suisse]
 *   searchBy(users, 'age', '42')               ❌ compile error: `age` is a number
 * TODO B1: make it generic (T for the item, K for the key), using KeysMatching.
 */
export function searchBy(items: readonly any[], key: string, query: string): any[] {
  return todo('B1');
}

/** Pre-coded: "Évry" → "evry" */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}
