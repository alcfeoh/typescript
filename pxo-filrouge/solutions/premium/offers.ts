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
      // Ici, `offer` vaut never. L'affecter à une variable de type `never` est la vérification.
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
  // Pas besoin de default : comme chaque cas retourne, TS sait que la fin est inatteignable,
  // et un cas manquant serait signalé par « Function lacks ending return statement ».
}
