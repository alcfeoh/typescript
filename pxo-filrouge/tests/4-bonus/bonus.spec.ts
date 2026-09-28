/**
 * Bonus — runtime tests (B1, B2, B3). The type-level half is in bonus.test-d.ts.
 * Run: npm run test:watch -- 4-bonus
 */
import { describe, expect, it } from 'vitest';
import { countNodes, flattenTree, ThreadSchema, type CommentNode } from '@/comments/comments';
import { monthlyCost, priceLabel } from '@/premium/offers';
import { COUNTRIES } from '@/shared/countries';
import { searchBy } from '@/shared/search';

describe('B1 — searchBy', () => {
  it('finds countries by name, ignoring case and accents', () => {
    expect(searchBy(COUNTRIES, 'name', 'ESPA').map((c) => c.code)).toEqual(['ES']);
    expect(searchBy(COUNTRIES, 'name', 'suis').map((c) => c.code)).toEqual(['CH']);
  });

  it('works on any string property', () => {
    expect(searchBy(COUNTRIES, 'dialCode', '+1').map((c) => c.code)).toEqual(['CA', 'US']);
  });

  it('returns everything for an empty query', () => {
    expect(searchBy(COUNTRIES, 'name', '')).toHaveLength(COUNTRIES.length);
  });
});

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

describe('B3 — comments', () => {
  const thread: CommentNode[] = [
    {
      id: 'cmt_1',
      author: 'A',
      text: 'one',
      replies: [
        { id: 'cmt_2', author: 'B', text: 'two', replies: [{ id: 'cmt_3', author: 'C', text: 'three', replies: [] }] },
      ],
    },
    { id: 'cmt_4', author: 'D', text: 'four', replies: [] },
  ];

  it('validates a whole thread, at every depth', () => {
    expect(ThreadSchema.safeParse(thread).success).toBe(true);

    const deepError = structuredClone(thread);
    deepError[0]!.replies[0]!.replies[0]!.text = '';
    expect(ThreadSchema.safeParse(deepError).success).toBe(false);

    expect(ThreadSchema.safeParse([{ id: 'cmt_9', author: 'E', text: 'no replies field' }]).success).toBe(false);
  });

  it('counts the nodes at every depth', () => {
    expect(countNodes(thread)).toBe(4);
    expect(countNodes([])).toBe(0);
  });

  it('flattens depth-first, parents before their replies', () => {
    expect(flattenTree(thread).map(({ node, depth }) => `${depth}:${node.text}`)).toEqual([
      '0:one',
      '1:two',
      '2:three',
      '0:four',
    ]);
  });

  it('works on any tree with `replies` — not only comments', () => {
    const menu = [{ label: 'File', replies: [{ label: 'Open', replies: [] }] }];

    expect(flattenTree(menu).map(({ node }) => node.label)).toEqual(['File', 'Open']);
  });
});
