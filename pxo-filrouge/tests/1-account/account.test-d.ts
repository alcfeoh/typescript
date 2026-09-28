/**
 * Case 1 — Account: type-level tests.
 * They are checked by the TypeScript compiler, not executed: Vitest runs tsc on *.test-d.ts
 * and turns each type error into a failed test. `npm run typecheck` shows the same errors.
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { SignupData, SignupFormInput } from '@/account/account-schema';
import { SignupSchema, UploadSchema } from '@/account/account-schema';
import type { Session, SignupResponse, UploadOptions, User } from '@/account/account-types';
import type { CountryCode } from '@/shared/countries';
import { type FieldErrors, type FormResult, validateForm } from '@/shared/form';

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

describe('A3 — FieldErrors, FormResult, validateForm', () => {
  it('FieldErrors has one optional string per field', () => {
    expectTypeOf<FieldErrors<{ email: string; age: number }>>().toEqualTypeOf<{ email?: string; age?: string }>();
  });

  it('FormResult is a discriminated union on `ok`', () => {
    expectTypeOf<FormResult<{ a: string }, { a: number }>>().toEqualTypeOf<
      { ok: true; data: { a: number } } | { ok: false; errors: { a?: string } }
    >();
  });

  it('validateForm infers both types from the schema it receives', () => {
    const result = validateForm(SignupSchema, {});
    expectTypeOf(result).toEqualTypeOf<FormResult<SignupFormInput, SignupData>>();

    if (result.ok) {
      expectTypeOf(result.data.country).toEqualTypeOf<CountryCode>();
    } else {
      expectTypeOf(result.errors).toHaveProperty('confirmPassword');
    }
  });

  it('…with any schema', () => {
    const result = validateForm(UploadSchema, {});
    if (result.ok) expectTypeOf(result.data.avatar).toEqualTypeOf<File>();
  });
});

describe('A4 — types derived from account-api.ts', () => {
  type ExpectedUser = { id: `usr_${string}`; email: string; displayName: string };

  it('SignupResponse is what signup() resolves to', () => {
    expectTypeOf<SignupResponse>().toEqualTypeOf<{ user: ExpectedUser; token: string } | null>();
  });

  it('Session is a successful response', () => {
    expectTypeOf<Session>().toEqualTypeOf<{ user: ExpectedUser; token: string }>();
  });

  it('User is the user part of a Session', () => {
    expectTypeOf<User>().toEqualTypeOf<ExpectedUser>();
  });

  it('UploadOptions is the second parameter of uploadAvatar()', () => {
    expectTypeOf<UploadOptions>().toEqualTypeOf<{ caption?: string; signal?: AbortSignal }>();
  });
});
