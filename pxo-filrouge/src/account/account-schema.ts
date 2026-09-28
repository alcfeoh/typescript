import * as z from 'zod';
import { COUNTRY_CODES } from '@/shared/countries'; // for A1: z.enum(COUNTRY_CODES)

// ---------------------------------------------------------------------------
// Pre-coded: the login form (used by the Playwright demo, T2).
// ---------------------------------------------------------------------------
export const LoginSchema = z.object({
  email: z.email({ error: 'Invalid email' }),
  password: z.string().min(1, { error: 'Password is required' }),
});

// ---------------------------------------------------------------------------
// A1 — Sign-up form. Three fields are done; add the others (see README, step A1).
// ---------------------------------------------------------------------------
export const SignupSchema = z.object({
  email: z.email({ error: 'Invalid email' }),
  displayName: z
    .string()
    .trim()
    .min(2, { error: 'At least 2 characters' })
    .max(30, { error: 'At most 30 characters' }),
  password: z.string().min(12, { error: 'At least 12 characters' }),
  // TODO A1: confirmPassword, country, newsletter, acceptTerms, e-mail normalisation
});

/** What the form sends (strings from FormData). */
export type SignupFormInput = z.input<typeof SignupSchema>;
/** What the schema hands back once parsed and transformed. */
export type SignupData = z.output<typeof SignupSchema>;

// ---------------------------------------------------------------------------
// A2 — Avatar upload.
// ---------------------------------------------------------------------------
export const AvatarSchema = z.file(); // TODO A2: at most 2 MB, PNG / JPEG / WebP / AVIF only

export const UploadSchema = z.object({
  avatar: AvatarSchema,
  // TODO A2: optional caption, at most 140 characters
});
