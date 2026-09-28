/**
 * A3 — validateForm — runtime test.
 * Run: npm run ex A3
 */
import { describe, expect, it } from 'vitest';
import { SignupSchema, UploadSchema } from '@/account/account-schema';
import { validateForm } from '@/shared/form';

/** What `formDataToObject(form)` gives for a correctly filled sign-up form. */
const validForm = {
  email: 'alice@pxo.fr',
  displayName: 'Alice',
  password: 'a-long-enough-password',
  confirmPassword: 'a-long-enough-password',
  country: 'FR',
  acceptTerms: 'on', // a checked checkbox sends "on"; an unchecked one sends nothing
};

const file = (sizeInBytes: number, type: string, name = 'avatar') => new File([new Uint8Array(sizeInBytes)], name, { type });

describe('A3 — validateForm', () => {
  it('returns the parsed data when the form is valid', () => {
    const result = validateForm(SignupSchema, validForm);

    expect(result).toEqual({ ok: true, data: SignupSchema.parse(validForm) });
  });

  it('returns one message per invalid field', () => {
    const result = validateForm(SignupSchema, { ...validForm, email: 'nope', displayName: 'A' });

    expect(result).toEqual({
      ok: false,
      errors: { email: 'Invalid email', displayName: 'At least 2 characters' },
    });
  });

  it('keeps only the FIRST message of a field', () => {
    const result = validateForm(SignupSchema, { ...validForm, password: 'short', confirmPassword: 'other' });

    expect(result).toMatchObject({ ok: false, errors: { password: 'At least 12 characters' } });
  });

  it('works with any schema', () => {
    expect(validateForm(UploadSchema, {})).toEqual({
      ok: false,
      errors: { avatar: 'Invalid input: expected file, received undefined' },
    });
  });
});
