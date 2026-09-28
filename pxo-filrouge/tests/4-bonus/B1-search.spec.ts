/**
 * B1 — searchBy — runtime test.
 * Run: npm run ex B1
 */
import { describe, expect, it } from 'vitest';
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
