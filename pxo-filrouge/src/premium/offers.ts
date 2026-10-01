// BONUS B2 — Le choix d'une offre premium.
import { formatPrice } from '@/shared/format'; // pour B2.3
import { todo } from '@/shared/todo';

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

/** TODO B2.1 : toutes les offres sauf 'free'. */
export type PaidOffer = any;

/**
 * TODO B2.2 : ce que coûte l'offre par mois. Une licence à vie est répartie sur 36 mois.
 * Le `switch` doit être exhaustif : ajoutez un type d'offre, et cette fonction ne doit plus compiler.
 */
export function monthlyCost(offer: PaidOffer): number {
  return todo('B2');
}

/**
 * TODO B2.3:
 *   free      → "Free"
 *   monthly   → "9,99 € / month"
 *   yearly    → "99,00 € / year"
 *   lifetime  → "249,00 € once, 5 seats"   ("1 seat" quand seats vaut 1)
 */
export function priceLabel(offer: Offer): string {
  return todo('B2');
}
