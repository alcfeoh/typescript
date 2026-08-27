/**
 * Lab E1 — TDD: red, green, refactor.
 *
 * How to run it:  npm run test:watch
 * How to start:   remove `.skip` on the describe below. Every test goes red.
 *                 Make ONE test pass at a time, in order, by editing `Cart`.
 *                 Never write implementation code that no failing test demands.
 */
import { describe, it, expect } from 'vitest';
import type { Product } from '../../app/types';

class Cart {
  add(_product: Product, _quantity = 1): void {
    throw new Error('Not implemented');
  }

  get count(): number {
    throw new Error('Not implemented');
  }

  get total(): number {
    throw new Error('Not implemented');
  }

  remove(_id: string): void {
    throw new Error('Not implemented');
  }

  applyPromoCode(_code: string): void {
    throw new Error('Not implemented');
  }
}

const product = (id: string, price: number): Product => ({
  id,
  title: `Product ${id}`,
  description: '',
  price,
});

// Remove `.skip` to start the lab.
describe.skip('Lab E1 — Cart', () => {
  it('starts empty', () => {
    const cart = new Cart();

    expect(cart.count).toBe(0);
    expect(cart.total).toBe(0);
  });

  it('adds a product', () => {
    const cart = new Cart();
    cart.add(product('1', 19.99));

    expect(cart.count).toBe(1);
    expect(cart.total).toBeCloseTo(19.99);
  });

  it('adds several units of the same product', () => {
    const cart = new Cart();
    cart.add(product('1', 10), 3);

    expect(cart.count).toBe(3);
    expect(cart.total).toBeCloseTo(30);
  });

  it('merges a product added twice instead of duplicating the line', () => {
    const cart = new Cart();
    cart.add(product('1', 10));
    cart.add(product('1', 10), 2);

    expect(cart.count).toBe(3);
    expect(cart.total).toBeCloseTo(30);
  });

  it('removes a product by id', () => {
    const cart = new Cart();
    cart.add(product('1', 10));
    cart.add(product('2', 5));
    cart.remove('1');

    expect(cart.count).toBe(1);
    expect(cart.total).toBeCloseTo(5);
  });

  it('ignores the removal of a product that is not in the cart', () => {
    const cart = new Cart();
    cart.add(product('1', 10));

    expect(() => cart.remove('nope')).not.toThrow();
    expect(cart.count).toBe(1);
  });

  it('rejects a quantity below 1', () => {
    const cart = new Cart();

    expect(() => cart.add(product('1', 10), 0)).toThrow(RangeError);
  });

  it('applies a 10% promo code to the total', () => {
    const cart = new Cart();
    cart.add(product('1', 100));
    cart.applyPromoCode('TS10');

    expect(cart.total).toBeCloseTo(90);
  });

  it('rejects an unknown promo code and leaves the total untouched', () => {
    const cart = new Cart();
    cart.add(product('1', 100));

    expect(() => cart.applyPromoCode('NOPE')).toThrow(/unknown promo/i);
    expect(cart.total).toBeCloseTo(100);
  });
});
