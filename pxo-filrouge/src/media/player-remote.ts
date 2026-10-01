// M4 (s'il reste du temps) — Raccourcis clavier, typés à partir de la classe VideoPlayer elle-même.
// Ajoutez une méthode au lecteur : elle devient une commande. Changez une signature : les raccourcis sont revérifiés.
import type { VideoPlayer } from '@/media/player';

/** Les noms des MÉTHODES de T (ni ses propriétés, ni ses getters). */
export type MethodKeys<T> = any; // TODO M4

/**
 * Les paramètres de la méthode K de T.
 * Parameters<T[K]> ne compile pas ici : TypeScript ne peut pas prouver que T[K] est une fonction.
 * Utilisez plutôt un type conditionnel avec `infer`.
 */
export type ArgsOf<T, K extends keyof T> = any; // TODO M4

export type PlayerCommand = MethodKeys<VideoPlayer>;

/**
 * Une commande suivie de SES arguments, sous forme de tuple :  ['skip', 10] ✅   ['skip', '10'] ❌   ['seek'] ❌
 * Indice : construisez un type objet { [C in PlayerCommand]: [C, ...ArgsOf<VideoPlayer, C>] }, puis indexez-le.
 */
export type Shortcut = any; // TODO M4

export const SHORTCUTS = {
  ' ': ['togglePlay'],
  k: ['togglePlay'],
  ArrowRight: ['skip', 5],
  ArrowLeft: ['skip', -5],
  ArrowUp: ['changeVolume', 0.1],
  ArrowDown: ['changeVolume', -0.1],
  m: ['toggleMute'],
  '0': ['seek', 0],
} satisfies Record<string, Shortcut>;

/** Déjà codé. Renvoie false si la touche n'est pas un raccourci. */
export function runShortcut(player: VideoPlayer, key: string): boolean {
  if (!Object.hasOwn(SHORTCUTS, key)) return false;
  const [command, ...args]: Shortcut = SHORTCUTS[key as keyof typeof SHORTCUTS];
  // Le seul cast : TS ne peut pas relier `command` à `args` une fois le tuple déstructuré.
  const method = player[command as keyof VideoPlayer] as (...args: unknown[]) => unknown;
  method.apply(player, args);
  return true;
}
