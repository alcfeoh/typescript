// Solution — A3.
import type * as z from 'zod';

export type FieldErrors<T> = Partial<Record<Extract<keyof T, string>, string>>;

export type FormResult<In, Out> = { ok: true; data: Out } | { ok: false; errors: FieldErrors<In> };

// S is the schema's own type (not its output): from it we derive BOTH z.input<S> and z.output<S>.
// `extends z.ZodType` is the constraint that gives access to .safeParse().
export function validateForm<S extends z.ZodType>(schema: S, input: unknown): FormResult<z.input<S>, z.output<S>> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };

  const errors: FieldErrors<z.input<S>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !(field in errors)) {
      // The cast is the one place where we tell TS "this string is one of the fields":
      // Zod's issue paths are typed PropertyKey[], it cannot know better.
      errors[field as Extract<keyof z.input<S>, string>] = issue.message;
    }
  }
  return { ok: false, errors };
}
