/**
 * B2 — offers — runtime test.
 * Run: npm run ex B2
 */
import { describe, expect, it } from 'vitest';
import { monthlyCost, priceLabel } from '@/premium/offers';

describe('B2 — offers', () => {
  // Intl.NumberFormat('fr-FR') puts a narrow no-break space before "€": compare with plain spaces.
  const label = (offer: Parameters<typeof priceLabel>[0]) => priceLabel(offer).replace(/\s/g, ' ');

  it('labels every kind of offer', () => {
    expect(label({ kind: 'free' })).toBe('Free');
    expect(label({ kind: 'monthly', pricePerMonth: 9.99 })).toBe('9,99 € / month');
    expect(label({ kind: 'yearly', pricePerYear: 99 })).toBe('99,00 € / year');
    expect(label({ kind: 'lifetime', price: 249, seats: 5 })).toBe('249,00 € once, 5 seats');
    expect(label({ kind: 'lifetime', price: 99, seats: 1 })).toBe('99,00 € once, 1 seat');
  });

  it('computes the monthly cost of a paid offer', () => {
    expect(monthlyCost({ kind: 'monthly', pricePerMonth: 9.99 })).toBe(9.99);
    expect(monthlyCost({ kind: 'yearly', pricePerYear: 99 })).toBeCloseTo(8.25);
    expect(monthlyCost({ kind: 'lifetime', price: 252, seats: 5 })).toBe(7);
  });
});
