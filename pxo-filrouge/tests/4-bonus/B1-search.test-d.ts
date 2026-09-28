/**
 * B1 — KeysMatching & searchBy — type-level test: checked by tsc, never executed.
 * Run: npm run ex B1
 */
import { describe, expectTypeOf, it } from 'vitest';
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
