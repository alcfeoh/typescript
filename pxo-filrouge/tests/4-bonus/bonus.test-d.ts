/**
 * Bonus — type-level tests (B1, B2, B3).
 */
import { describe, expectTypeOf, it } from 'vitest';
import type * as z from 'zod';
import { flattenTree, type CommentNode, type CommentSchema } from '@/comments/comments';
import type { Offer, PaidOffer } from '@/premium/offers';
import { COUNTRIES, type Country } from '@/shared/countries';
import { searchBy, type KeysMatching } from '@/shared/search';

describe('B1 — KeysMatching & searchBy', () => {
  it('keeps the keys whose value matches', () => {
    type User = { id: number; name: string; email: string; admin: boolean; nickname?: string };
    expectTypeOf<KeysMatching<User, string>>().toEqualTypeOf<'name' | 'email'>();
    expectTypeOf<KeysMatching<User, number>>().toEqualTypeOf<'id'>();
  });

  it('returns the item type, and only accepts string keys', () => {
    expectTypeOf(searchBy(COUNTRIES, 'name', 'fr')).toEqualTypeOf<Country[]>();

    const users = [{ name: 'Alice', age: 42 }];
    // @ts-expect-error — `age` is a number
    searchBy(users, 'age', '42');
  });
});

describe('B2 — PaidOffer', () => {
  it('is every offer but the free one', () => {
    expectTypeOf<PaidOffer['kind']>().toEqualTypeOf<'monthly' | 'yearly' | 'lifetime'>();
    expectTypeOf<PaidOffer>().toExtend<Offer>();
  });
});

describe('B3 — recursive schema & generic trees', () => {
  it('the schema outputs CommentNode', () => {
    expectTypeOf<z.output<typeof CommentSchema>>().toEqualTypeOf<CommentNode>();
  });

  it('flattenTree keeps the node type', () => {
    const menu = [{ label: 'File', replies: [] as { label: string; replies: never[] }[] }];
    expectTypeOf(flattenTree(menu)[0]!.node.label).toBeString();

    // @ts-expect-error — not a tree: no `replies`
    flattenTree([{ label: 'File' }]);
  });
});
