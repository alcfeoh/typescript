/**
 * Case 1 — Account: runtime tests. The type-level half is in account.test-d.ts.
 * Run: npm run test:watch -- 1-account
 */
import { describe, expect, it } from 'vitest';
import { AvatarSchema, SignupSchema, UploadSchema } from '@/account/account-schema';
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

function messagesFor(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }, field: string) {
  return (result.error?.issues ?? []).filter((issue) => issue.path[0] === field).map((issue) => issue.message);
}

const file = (sizeInBytes: number, type: string, name = 'avatar') => new File([new Uint8Array(sizeInBytes)], name, { type });

describe('A1 — SignupSchema', () => {
  it('accepts a valid form and converts the checkboxes to booleans', () => {
    const data = SignupSchema.parse(validForm);

    expect(data).toEqual({
      email: 'alice@pxo.fr',
      displayName: 'Alice',
      password: 'a-long-enough-password',
      confirmPassword: 'a-long-enough-password',
      country: 'FR',
      newsletter: false, // unchecked: absent from the form → false
      acceptTerms: true,
    });
  });

  it('reads a checked newsletter box ("on") as true', () => {
    expect(SignupSchema.parse({ ...validForm, newsletter: 'on' })).toMatchObject({ newsletter: true });
  });

  it('normalises the e-mail: trimmed and lower-cased BEFORE being validated', () => {
    expect(SignupSchema.parse({ ...validForm, email: '  Alice@PXO.fr ' })).toMatchObject({ email: 'alice@pxo.fr' });
  });

  it('reports mismatching passwords on the confirmPassword field', () => {
    const result = SignupSchema.safeParse({ ...validForm, confirmPassword: 'something-else-entirely' });

    expect(result.success).toBe(false);
    expect(messagesFor(result, 'confirmPassword')).toEqual(['Passwords do not match']);
  });

  it('rejects a country that is not in the list', () => {
    const result = SignupSchema.safeParse({ ...validForm, country: 'XX' });

    expect(messagesFor(result, 'country')).toEqual(['Please pick a country']);
  });

  it('requires the terms to be accepted', () => {
    const { acceptTerms: _, ...withoutTerms } = validForm;
    const result = SignupSchema.safeParse(withoutTerms);

    expect(messagesFor(result, 'acceptTerms')).toEqual(['You must accept the terms']);
  });
});

describe('A2 — AvatarSchema & UploadSchema', () => {
  it('accepts a 1 MB PNG', () => {
    expect(AvatarSchema.safeParse(file(1024 * 1024, 'image/png')).success).toBe(true);
  });

  it('accepts JPEG, WebP and AVIF', () => {
    for (const type of ['image/jpeg', 'image/webp', 'image/avif']) {
      expect(AvatarSchema.safeParse(file(10, type)).success, type).toBe(true);
    }
  });

  it('rejects a file over 2 MB', () => {
    const result = AvatarSchema.safeParse(file(2 * 1024 * 1024 + 1, 'image/png'));

    expect(result.error?.issues.map((i) => i.message)).toEqual(['2 MB maximum']);
  });

  it('rejects a GIF', () => {
    const result = AvatarSchema.safeParse(file(10, 'image/gif'));

    expect(result.error?.issues.map((i) => i.message)).toEqual(['PNG, JPEG, WebP or AVIF only']);
  });

  it('accepts an optional caption of at most 140 characters', () => {
    const avatar = file(10, 'image/png');

    expect(UploadSchema.safeParse({ avatar }).success).toBe(true);
    expect(UploadSchema.safeParse({ avatar, caption: 'Me, in Lorient' }).success).toBe(true);
    expect(UploadSchema.safeParse({ avatar, caption: 'x'.repeat(141) }).success).toBe(false);
  });
});

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
