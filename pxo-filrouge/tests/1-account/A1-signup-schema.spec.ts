/**
 * A1 — SignupSchema — runtime test.
 * Run: npm run ex A1
 */
import { describe, expect, it } from 'vitest';
import { SignupSchema } from '@/account/account-schema';

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
