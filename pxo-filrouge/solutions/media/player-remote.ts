// Solution — M4.
import type { VideoPlayer } from '@/media/player';

// Mapped type + conditional: keep K when T[K] is a function, then collect the keys.
// Getters are properties to the type system: `volume` (number) and `isPlaying` (boolean) drop out.
export type MethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never;
}[keyof T];

// Parameters<T[K]> fails: its constraint `(...args: any) => any` cannot be proven for T[K].
// Writing the conditional ourselves, with infer, has no such constraint.
export type ArgsOf<T, K extends keyof T> = T[K] extends (...args: infer A) => unknown ? A : never;

export type PlayerCommand = MethodKeys<VideoPlayer>;

// One tuple type per command, then indexed by all commands → the union of the valid tuples.
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
