/**
 * Module E — Anatomy of a test & matchers.
 *
 * describe = a group, it = one behaviour, expect = one assertion.
 * The key distinction: toBe is Object.is (identity), toEqual is structural.
 */
import { describe, it, expect } from 'vitest';
import type { Product } from '../app/types';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    title: 'Wireless Headphones',
    description: 'High-quality noise-canceling wireless headphones.',
    price: 199.99,
    brand: 'SoundMax',
    ...overrides,
  };
}

describe('toBe vs toEqual', () => {
  it('toBe compares identity — same reference', () => {
    const product = makeProduct();
    const alias = product;

    expect(alias).toBe(product);
  });

  it('toBe fails on two structurally identical objects', () => {
    expect(makeProduct()).not.toBe(makeProduct());
  });

  it('toEqual compares structure, recursively', () => {
    expect(makeProduct()).toEqual(makeProduct());
  });

  it('toStrictEqual also checks undefined keys and the prototype', () => {
    const withUndefinedBrand = { ...makeProduct(), brand: undefined };

    // toEqual ignores an explicit `undefined`; toStrictEqual does not.
    expect(withUndefinedBrand).toEqual(makeProduct({ brand: undefined }));
    expect({ a: 1, b: undefined }).toEqual({ a: 1 });
    expect({ a: 1, b: undefined }).not.toStrictEqual({ a: 1 });
  });
});

describe('matchers worth knowing', () => {
  it('compares floats with toBeCloseTo, never toBe', () => {
    const total = 0.1 + 0.2;

    expect(total).not.toBe(0.3);
    expect(total).toBeCloseTo(0.3);
  });

  it('asserts on a subset with toMatchObject', () => {
    expect(makeProduct()).toMatchObject({ id: '1', brand: 'SoundMax' });
  });

  it('works on collections', () => {
    const catalog = [makeProduct(), makeProduct({ id: '2', title: 'Smartwatch' })];

    expect(catalog).toHaveLength(2);
    expect(catalog.map((p) => p.id)).toEqual(['1', '2']);
    expect(catalog).toContainEqual(makeProduct());
  });

  it('asserts that a function throws', () => {
    const parsePrice = (raw: string): number => {
      const value = Number(raw);
      if (Number.isNaN(value)) throw new RangeError(`Not a price: ${raw}`);
      return value;
    };

    expect(() => parsePrice('abc')).toThrow(RangeError);
    expect(() => parsePrice('abc')).toThrow(/Not a price/);
    expect(parsePrice('12.50')).toBe(12.5);
  });
});
