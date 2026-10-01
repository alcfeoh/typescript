// Solution — A1 et A2.
import * as z from 'zod';
import { COUNTRY_CODES } from '@/shared/countries';

export const LoginSchema = z.object({
  email: z.email({ error: 'Invalid email' }),
  password: z.string().min(1, { error: 'Password is required' }),
});

export const SignupSchema = z
  .object({
    // Piège : z.email().trim() valide D'ABORD, puis supprime les espaces — "  a@b.fr " est refusé.
    // Pour normaliser avant de valider, on transforme une chaîne simple, puis on la passe à z.email() avec pipe.
    email: z.string().trim().toLowerCase().pipe(z.email({ error: 'Invalid email' })),
    displayName: z
      .string()
      .trim()
      .min(2, { error: 'At least 2 characters' })
      .max(30, { error: 'At most 30 characters' }),
    password: z.string().min(12, { error: 'At least 12 characters' }),
    confirmPassword: z.string(),
    country: z.enum(COUNTRY_CODES, { error: 'Please pick a country' }),
    // "on" / "true" / "1" / "yes"… → true. Case non cochée = champ absent → false par défaut.
    newsletter: z.stringbool().default(false),
    // Entrée 'on', sortie true : l'API reçoit un booléen, pas une particularité des cases à cocher.
    acceptTerms: z.literal('on', { error: 'You must accept the terms' }).transform(() => true as const),
  })
  // Règle entre deux champs : un refine sur l'objet entier. `path` rattache l'erreur à un champ.
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupFormInput = z.input<typeof SignupSchema>;
export type SignupData = z.output<typeof SignupSchema>;

export const AvatarSchema = z
  .file()
  .max(2 * 1024 * 1024, { error: '2 MB maximum' })
  .mime(['image/png', 'image/jpeg', 'image/webp', 'image/avif'], { error: 'PNG, JPEG, WebP or AVIF only' });

export const UploadSchema = z.object({
  avatar: AvatarSchema,
  caption: z.string().max(140, { error: '140 characters maximum' }).optional(),
});
