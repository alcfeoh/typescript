/**
 * A4 — types derived from account-api.ts — type-level test: checked by tsc, never executed.
 * Run: npm run ex A4
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { Session, SignupResponse, UploadOptions, User } from '@/account/account-types';

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
