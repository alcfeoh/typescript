// M4 (if time allows) — Keyboard shortcuts, typed from the VideoPlayer class itself.
// Add a method to the player: it becomes a command. Change a signature: the shortcuts are re-checked.
import type { VideoPlayer } from '@/media/player';

/** The names of T's METHODS (not its fields, not its getters). */
export type MethodKeys<T> = any; // TODO M4

/**
 * The parameters of the method K of T.
 * Parameters<T[K]> does not compile here: TypeScript cannot prove that T[K] is a function.
 * Use a conditional type with `infer` instead.
 */
export type ArgsOf<T, K extends keyof T> = any; // TODO M4

export type PlayerCommand = MethodKeys<VideoPlayer>;

/**
 * A command and ITS arguments, as a tuple:  ['skip', 10] ✅   ['skip', '10'] ❌   ['seek'] ❌
 * Hint: build an object type { [C in PlayerCommand]: [C, ...ArgsOf<VideoPlayer, C>] }, then index it.
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

/** Pre-coded. Returns false when the key is not a shortcut. */
export function runShortcut(player: VideoPlayer, key: string): boolean {
  if (!Object.hasOwn(SHORTCUTS, key)) return false;
  const [command, ...args]: Shortcut = SHORTCUTS[key as keyof typeof SHORTCUTS];
  // The one cast: TS cannot correlate `command` with `args` once the tuple is destructured.
  const method = player[command as keyof VideoPlayer] as (...args: unknown[]) => unknown;
  method.apply(player, args);
  return true;
}
