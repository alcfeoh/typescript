// BONUS B2 — The premium offer picker.
import { formatPrice } from '@/shared/format'; // for B2.3
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

/** TODO B2.1: every offer except 'free'. */
export type PaidOffer = any;

/**
 * TODO B2.2: what the offer costs per month. A lifetime licence is spread over 36 months.
 * The `switch` must be exhaustive: add an offer kind, and this function must stop compiling.
 */
export function monthlyCost(offer: PaidOffer): number {
  return todo('B2');
}

/**
 * TODO B2.3:
 *   free      → "Free"
 *   monthly   → "9,99 € / month"
 *   yearly    → "99,00 € / year"
 *   lifetime  → "249,00 € once, 5 seats"   ("1 seat" when seats is 1)
 */
export function priceLabel(offer: Offer): string {
  return todo('B2');
}
