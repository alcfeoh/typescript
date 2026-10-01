// Solution — A4.
import type { signup, uploadAvatar } from '@/account/account-api';

// ReturnType donne Promise<…> ; Awaited en extrait le contenu.
export type SignupResponse = Awaited<ReturnType<typeof signup>>;

// NonNullable retire null et undefined d'une union.
export type Session = NonNullable<SignupResponse>;

// Accès indexé sur un type.
export type User = Session['user'];

// Parameters donne un tuple : [file: File, options?: {…}] → élément 1, puis on retire `undefined`.
export type UploadOptions = NonNullable<Parameters<typeof uploadAvatar>[1]>;
