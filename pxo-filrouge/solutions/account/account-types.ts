// Solution — A4.
import type { signup, uploadAvatar } from '@/account/account-api';

// ReturnType gives Promise<…>; Awaited unwraps it.
export type SignupResponse = Awaited<ReturnType<typeof signup>>;

// NonNullable removes null and undefined from a union.
export type Session = NonNullable<SignupResponse>;

// Indexed access type.
export type User = Session['user'];

// Parameters gives a tuple: [file: File, options?: {…}] → element 1, then remove `undefined`.
export type UploadOptions = NonNullable<Parameters<typeof uploadAvatar>[1]>;
