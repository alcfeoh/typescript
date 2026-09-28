/**
 * A1 — input vs output types of the sign-up schema — type-level test: checked by tsc, never executed.
 * Run: npm run ex A1
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { SignupData, SignupFormInput } from '@/account/account-schema';
import type { CountryCode } from '@/shared/countries';

describe('A1 — input vs output types of the sign-up schema', () => {
  it('outputs typed values: a CountryCode, real booleans, and `true` for the terms', () => {
    expectTypeOf<SignupData>().toEqualTypeOf<{
      email: string;
      displayName: string;
      password: string;
      confirmPassword: string;
      country: CountryCode;
      newsletter: boolean;
      acceptTerms: true;
    }>();
  });

  it('takes what an HTML form sends: strings, and nothing at all for an unchecked box', () => {
    expectTypeOf<SignupFormInput['newsletter']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<SignupFormInput['acceptTerms']>().toEqualTypeOf<'on'>();
  });
});
