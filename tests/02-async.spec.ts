/**
 * Module E — Asynchronous tests.
 *
 * Rule: either `await` the promise, or return the `expect(...).resolves` chain.
 * A forgotten await is the classic false-green test.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Product } from '../app/types';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function fetchProduct(id: string): Promise<Product> {
  await delay(10);
  if (id !== '1') throw new Error(`Unknown product: ${id}`);
  return {
    id: '1',
    title: 'Wireless Headphones',
    description: 'High-quality noise-canceling wireless headphones.',
    price: 199.99,
  };
}

describe('async/await', () => {
  it('awaits the result', async () => {
    const product = await fetchProduct('1');

    expect(product.title).toBe('Wireless Headphones');
  });

  it('asserts on a rejection with rejects', async () => {
    await expect(fetchProduct('999')).rejects.toThrow('Unknown product: 999');
  });

  it('asserts on a resolution with resolves', async () => {
    await expect(fetchProduct('1')).resolves.toMatchObject({ id: '1' });
  });

  it('guards against a silently skipped assertion', async () => {
    expect.assertions(1); // fails the test if the assertion below never runs

    try {
      await fetchProduct('999');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('fake timers', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('runs a debounced call without really waiting', () => {
    const save = vi.fn();
    const debouncedSave = (delayMs: number) => setTimeout(save, delayMs);

    debouncedSave(5000);
    expect(save).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5000);
    expect(save).toHaveBeenCalledOnce();
  });
});
