// Solution — A3.
import type * as z from 'zod';

export type FieldErrors<T> = Partial<Record<Extract<keyof T, string>, string>>;

export type FormResult<In, Out> = { ok: true; data: Out } | { ok: false; errors: FieldErrors<In> };

// S est le type du schéma lui-même (pas de sa sortie) : on en dérive À LA FOIS z.input<S> et z.output<S>.
// `extends z.ZodType` est la contrainte qui donne accès à .safeParse().
export function validateForm<S extends z.ZodType>(schema: S, input: unknown): FormResult<z.input<S>, z.output<S>> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };

  const errors: FieldErrors<z.input<S>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !(field in errors)) {
      // Le cast est le seul endroit où l'on dit à TS « cette chaîne est l'un des champs » :
      // Zod type les chemins d'erreur en PropertyKey[], il ne peut pas en savoir plus.
      errors[field as Extract<keyof z.input<S>, string>] = issue.message;
    }
  }
  return { ok: false, errors };
}
