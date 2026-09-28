/**
 * A3 — FieldErrors, FormResult, validateForm — type-level test: checked by tsc, never executed.
 * Run: npm run ex A3
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { SignupData, SignupFormInput } from '@/account/account-schema';
import { SignupSchema, UploadSchema } from '@/account/account-schema';
import type { CountryCode } from '@/shared/countries';
import { type FieldErrors, type FormResult, validateForm } from '@/shared/form';

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
