// BONUS B1 — Une recherche générique et typée, utilisée par le sélecteur de pays du formulaire d'inscription.
import { todo } from '@/shared/todo';

/**
 * Les clés de T dont la valeur est une chaîne.
 * KeysMatching<{ code: 'FR'; name: string; population: number }, string> → 'code' | 'name'
 */
export type KeysMatching<T, V> = any; // TODO B1

/**
 * Recherche « contient », insensible à la casse et aux accents, sur UNE propriété chaîne des éléments.
 *   searchBy(COUNTRIES, 'name', 'suis')        ✅ → [Suisse]
 *   searchBy(users, 'age', '42')               ❌ erreur de compilation : `age` est un nombre
 * TODO B1 : rendez-la générique (T pour l'élément, K pour la clé), avec KeysMatching.
 */
export function searchBy(items: readonly any[], key: string, query: string): any[] {
  return todo('B1');
}

/** Déjà codé : "Évry" → "evry" */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}
