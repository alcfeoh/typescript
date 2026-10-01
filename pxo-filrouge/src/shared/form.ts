// A3 — Une seule fonction de validation générique pour tous les formulaires de l'app.
import type * as z from 'zod';
import { todo } from '@/shared/todo';

/**
 * Un message d'erreur par champ, indexé par le nom des champs du formulaire.
 * FieldErrors<{ email: string; age: number }> → { email?: string; age?: string }
 */
export type FieldErrors<T> = any; // TODO A3

/**
 * Soit les données validées (typées selon la SORTIE du schéma),
 * soit les erreurs par champ (indexées par les champs de l'ENTRÉE du schéma).
 */
export type FormResult<In, Out> = any; // TODO A3

/**
 * TODO A3 : rendez cette fonction générique, pour que
 *   validateForm(SignupSchema, raw) renvoie FormResult<SignupFormInput, SignupData>
 * Ne gardez que le PREMIER message de chaque champ.
 */
export function validateForm(schema: z.ZodType, input: unknown): any {
  return todo('A3');
}
