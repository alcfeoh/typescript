/**
 * M2 — Previewable is a constrained mixin — type-level test: checked by tsc, never executed.
 * Run: npm run ex M2
 */
import { describe, it } from 'vitest';
import { BasePlayer, Playable, Previewable, Seekable } from '@/media/player';

describe('M2 — Previewable is a constrained mixin', () => {
  it('accepts a base that can play and seek', () => {
    Previewable(Seekable(Playable(BasePlayer)));
  });

  it('rejects a base that cannot', () => {
    // @ts-expect-error — BasePlayer has no play() / pause() / seek()
    Previewable(BasePlayer);
    // @ts-expect-error — Playable alone cannot seek()
    Previewable(Playable(BasePlayer));
  });
});
