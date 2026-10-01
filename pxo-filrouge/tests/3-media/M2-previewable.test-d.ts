/**
 * M2 — Previewable est un mixin contraint — tests de types : vérifiés par tsc, jamais exécutés.
 * Lancer : npm run ex M2
 */
import { describe, it } from 'vitest';
import { BasePlayer, Playable, Previewable, Seekable } from '@/media/player';

describe('M2 — Previewable is a constrained mixin', () => {
  it('accepts a base that can play and seek', () => {
    Previewable(Seekable(Playable(BasePlayer)));
  });

  it('rejects a base that cannot', () => {
    // @ts-expect-error — BasePlayer n'a ni play(), ni pause(), ni seek()
    Previewable(BasePlayer);
    // @ts-expect-error — Playable seul ne sait pas faire seek()
    Previewable(Playable(BasePlayer));
  });
});
