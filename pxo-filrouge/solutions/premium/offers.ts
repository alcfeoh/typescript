// Solution — B2.
import { formatPrice } from '@/shared/format';

export type Offer =
  | { kind: 'free' }
  | { kind: 'monthly'; pricePerMonth: number }
  | { kind: 'yearly'; pricePerYear: number }
  | { kind: 'lifetime'; price: number; seats: 1 | 5 };

export const OFFERS = [
  { kind: 'free' },
  { kind: 'monthly', pricePerMonth: 9.99 },
  { kind: 'yearly', pricePerYear: 99 },
  { kind: 'lifetime', price: 249, seats: 5 },
] as const satisfies readonly Offer[];

export type PaidOffer = Exclude<Offer, { kind: 'free' }>;

export function monthlyCost(offer: PaidOffer): number {
  switch (offer.kind) {
    case 'monthly':
      return offer.pricePerMonth;
    case 'yearly':
      return offer.pricePerYear / 12;
    case 'lifetime':
      return offer.price / 36;
    default: {
      // `offer` is never here. Assigning it to a `never` variable is the check.
      const unreachable: never = offer;
      return unreachable;
    }
  }
}

export function priceLabel(offer: Offer): string {
  switch (offer.kind) {
    case 'free':
      return 'Free';
    case 'monthly':
      return `${formatPrice(offer.pricePerMonth)} / month`;
    case 'yearly':
      return `${formatPrice(offer.pricePerYear)} / year`;
    case 'lifetime':
      return `${formatPrice(offer.price)} once, ${offer.seats} ${offer.seats === 1 ? 'seat' : 'seats'}`;
  }
  // No default needed: with every case returning, TS knows the end is unreachable,
  // and a missing case would be reported as "not all code paths return a value".
}
