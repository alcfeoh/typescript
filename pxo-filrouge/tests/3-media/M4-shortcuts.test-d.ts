/**
 * M4 — commandes typées à partir de la classe — tests de types : vérifiés par tsc, jamais exécutés.
 * Lancer : npm run ex M4
 */
import { describe, expectTypeOf, it } from 'vitest';
import { type VideoPlayer } from '@/media/player';
import type { ArgsOf, MethodKeys, PlayerCommand, Shortcut } from '@/media/player-remote';

describe('M4 — commands typed from the class', () => {
  it('MethodKeys keeps the methods only', () => {
    class Sample {
      count = 0;
      get double(): number {
        return this.count * 2;
      }
      increment(by: number): void {
        this.count += by;
      }
      reset(): void {
        this.count = 0;
      }
    }
    expectTypeOf<MethodKeys<Sample>>().toEqualTypeOf<'increment' | 'reset'>();
  });

  it('PlayerCommand lists what the player can do', () => {
    expectTypeOf<PlayerCommand>().toEqualTypeOf<
      'play' | 'pause' | 'togglePlay' | 'seek' | 'skip' | 'startPreview' | 'stopPreview' | 'changeVolume' | 'toggleMute'
    >();
  });

  it('ArgsOf gives the parameters of one method', () => {
    expectTypeOf<ArgsOf<VideoPlayer, 'seek'>>().toEqualTypeOf<[seconds: number]>();
    expectTypeOf<ArgsOf<VideoPlayer, 'togglePlay'>>().toEqualTypeOf<[]>();
  });

  it('a Shortcut is a command followed by ITS arguments', () => {
    const skip: Shortcut = ['skip', 10];
    const toggle: Shortcut = ['togglePlay'];
    // @ts-expect-error — skip attend un nombre
    const wrongType: Shortcut = ['skip', '10'];
    // @ts-expect-error — seek a besoin de son argument
    const missing: Shortcut = ['seek'];
    // @ts-expect-error — volume est un setter, pas une commande
    const notACommand: Shortcut = ['volume', 1];
    void [skip, toggle, wrongType, missing, notACommand];
  });
});
