// Solution — M4.
import type { VideoPlayer } from '@/media/player';

// Mapped type + conditionnel : on garde K quand T[K] est une fonction, puis on réunit les clés.
// Pour le système de types, un getter est une propriété : `volume` (number) et `isPlaying` (boolean) sont éliminés.
export type MethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never;
}[keyof T];

// Parameters<T[K]> échoue : sa contrainte `(...args: any) => any` ne peut pas être prouvée pour T[K].
// En écrivant le conditionnel nous-mêmes, avec infer, on n'a pas cette contrainte.
export type ArgsOf<T, K extends keyof T> = T[K] extends (...args: infer A) => unknown ? A : never;

export type PlayerCommand = MethodKeys<VideoPlayer>;

// Un type tuple par commande, puis indexé par toutes les commandes → l'union des tuples valides.
export type Shortcut = {
  [C in PlayerCommand]: [C, ...ArgsOf<VideoPlayer, C>];
}[PlayerCommand];

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

export function runShortcut(player: VideoPlayer, key: string): boolean {
  if (!Object.hasOwn(SHORTCUTS, key)) return false;
  const [command, ...args]: Shortcut = SHORTCUTS[key as keyof typeof SHORTCUTS];
  const method = player[command] as (...args: unknown[]) => unknown;
  method.apply(player, args);
  return true;
}
