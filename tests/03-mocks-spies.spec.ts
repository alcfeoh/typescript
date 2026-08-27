/**
 * Module E — Mocks and spies.
 *
 * vi.fn()    -> a brand new fake function you control.
 * vi.spyOn() -> wraps an existing method so you can observe (and optionally replace) it.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Product } from '../app/types';

type Logger = { info: (message: string) => void };

function checkout(cart: Product[], logger: Logger): number {
  const total = cart.reduce((sum, p) => sum + p.price, 0);
  logger.info(`Charging ${total.toFixed(2)}`);
  return total;
}

const product = (id: string, price: number): Product => ({
  id,
  title: `Product ${id}`,
  description: '',
  price,
});

describe('vi.fn — a fake you control', () => {
  it('records the calls it received', () => {
    const logger: Logger = { info: vi.fn() };

    checkout([product('1', 10), product('2', 5.5)], logger);

    expect(logger.info).toHaveBeenCalledOnce();
    expect(logger.info).toHaveBeenCalledWith('Charging 15.50');
    expect(vi.mocked(logger.info).mock.calls[0][0]).toContain('15.50');
  });

  it('can be programmed with return values', () => {
    const rate = vi.fn<(from: string, to: string) => number>();
    rate.mockReturnValueOnce(0.92).mockReturnValue(1);

    expect(rate('USD', 'EUR')).toBe(0.92);
    expect(rate('USD', 'EUR')).toBe(1);
    expect(rate).toHaveBeenCalledTimes(2);
  });

  it('can be programmed to reject', async () => {
    const load = vi.fn().mockRejectedValue(new Error('offline'));

    await expect(load()).rejects.toThrow('offline');
  });
});

describe('vi.spyOn — observe a real object', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps the real implementation while recording calls', () => {
    const console_ = { info: (msg: string) => msg };
    const spy = vi.spyOn(console_, 'info');

    expect(console_.info('hello')).toBe('hello'); // real behaviour preserved
    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('replaces the implementation when asked', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.42);

    expect(Math.random()).toBe(0.42);

    spy.mockRestore();
    expect(Math.random()).not.toBe(0.42);
  });

  it('stubs a global — here, fetch', async () => {
    const json = { id: '1', title: 'Wireless Headphones' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => json }));

    const response = await fetch('/api/products/1');

    expect(await response.json()).toEqual(json);
    expect(fetch).toHaveBeenCalledWith('/api/products/1');
    vi.unstubAllGlobals();
  });
});
