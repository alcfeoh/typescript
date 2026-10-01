/**
 * B2 — PaidOffer — tests de types : vérifiés par tsc, jamais exécutés.
 * Lancer : npm run ex B2
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { Offer, PaidOffer } from '@/premium/offers';

describe('B2 — PaidOffer', () => {
  it('is every offer but the free one', () => {
    expectTypeOf<PaidOffer['kind']>().toEqualTypeOf<'monthly' | 'yearly' | 'lifetime'>();
    expectTypeOf<PaidOffer>().toExtend<Offer>();
  });
});
