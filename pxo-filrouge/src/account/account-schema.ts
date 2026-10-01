import * as z from 'zod';
import { COUNTRY_CODES } from '@/shared/countries'; // pour A1 : z.enum(COUNTRY_CODES)

// ---------------------------------------------------------------------------
// Déjà codé : le formulaire de connexion (utilisé par la démo Playwright, T2).
// ---------------------------------------------------------------------------
export const LoginSchema = z.object({
  email: z.email({ error: 'Invalid email' }),
  password: z.string().min(1, { error: 'Password is required' }),
});

// ---------------------------------------------------------------------------
// A1 — Formulaire d'inscription. Trois champs sont faits ; ajoutez les autres (voir README, étape A1).
// ---------------------------------------------------------------------------
export const SignupSchema = z.object({
  email: z.email({ error: 'Invalid email' }),
  displayName: z
    .string()
    .trim()
    .min(2, { error: 'At least 2 characters' })
    .max(30, { error: 'At most 30 characters' }),
  password: z.string().min(12, { error: 'At least 12 characters' }),
  // TODO A1 : confirmPassword, country, newsletter, acceptTerms, normalisation de l'e-mail
});

/** Ce que le formulaire envoie (des chaînes issues de FormData). */
export type SignupFormInput = z.input<typeof SignupSchema>;
/** Ce que le schéma renvoie, une fois les données validées et converties. */
export type SignupData = z.output<typeof SignupSchema>;

// ---------------------------------------------------------------------------
// A2 — Upload de l'avatar.
// ---------------------------------------------------------------------------
export const AvatarSchema = z.file(); // TODO A2 : 2 Mo maximum, PNG / JPEG / WebP / AVIF uniquement

export const UploadSchema = z.object({
  avatar: AvatarSchema,
  // TODO A2 : légende facultative, 140 caractères maximum
});
