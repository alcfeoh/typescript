// A4 — Derive the types the pages need from account-api.ts, which does not export them.
// Tools: ReturnType, Awaited, NonNullable, Parameters, indexed access (T['key']).
//
// Every placeholder is `any`: everything compiles, nothing is checked.
// Replace them one by one — then run `npm run typecheck` and look at welcome.ts.
import type { signup, uploadAvatar } from '@/account/account-api';

/** What `signup()` resolves to, null included. */
export type SignupResponse = any; // TODO A4

/** A successful sign-up: SignupResponse without the null. */
export type Session = any; // TODO A4

/** The `user` part of a Session. */
export type User = any; // TODO A4

/** The options object `uploadAvatar()` accepts (the second parameter, without undefined). */
export type UploadOptions = any; // TODO A4
