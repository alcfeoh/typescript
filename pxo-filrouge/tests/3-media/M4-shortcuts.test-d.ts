/**
 * M4 — commands typed from the class — type-level test: checked by tsc, never executed.
 * Run: npm run ex M4
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
    // @ts-expect-error — skip takes a number
    const wrongType: Shortcut = ['skip', '10'];
    // @ts-expect-error — seek needs its argument
    const missing: Shortcut = ['seek'];
    // @ts-expect-error — volume is a setter, not a command
    const notACommand: Shortcut = ['volume', 1];
    void [skip, toggle, wrongType, missing, notACommand];
  });
});
