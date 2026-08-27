/**
 * Module E — Mocking a whole module.
 *
 * vi.mock is hoisted above the imports, so it cannot close over variables
 * declared later — use a factory, or vi.hoisted, to build the fake.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { greet } from './fixtures/greeting-service';
import { now } from './fixtures/clock';

vi.mock('./fixtures/clock', () => ({
  now: vi.fn(() => new Date('2026-01-01T09:00:00')),
}));

describe('vi.mock', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses the fake module by default', () => {
    expect(greet('Alain')).toBe('Good morning, Alain!');
    expect(now).toHaveBeenCalledOnce();
  });

  it('re-programs the fake per test', () => {
    vi.mocked(now).mockReturnValue(new Date('2026-01-01T20:30:00'));

    expect(greet('Alain')).toBe('Good evening, Alain!');
  });
});

// vi.hoisted runs before the imports above — it must sit at the top level.
const { fixedNow } = vi.hoisted(() => ({ fixedNow: new Date('2026-06-01T14:00:00') }));

describe('vi.hoisted — when the fake needs shared state', () => {
  it('lets the mock factory reuse a value defined in the test file', () => {
    vi.mocked(now).mockReturnValue(fixedNow);

    expect(greet('Alain')).toBe('Good afternoon, Alain!');
  });
});

/**
 * For HTTP, prefer intercepting the network over mocking your own fetch wrapper:
 * MSW (`npm i -D msw`) defines handlers once and reuses them in tests and in the
 * browser. `vi.stubGlobal('fetch', ...)` (see 03-mocks-spies.spec.ts) is the
 * dependency-free fallback.
 */
