// A3 — One generic validation function for every form of the app.
import type * as z from 'zod';
import { todo } from '@/shared/todo';

/**
 * One error message per field, keyed by the form's field names.
 * FieldErrors<{ email: string; age: number }> → { email?: string; age?: string }
 */
export type FieldErrors<T> = any; // TODO A3

/**
 * Either the parsed data (typed as the schema's OUTPUT),
 * or the field errors (keyed by the schema's INPUT fields).
 */
export type FormResult<In, Out> = any; // TODO A3

/**
 * TODO A3: make this function generic, so that
 *   validateForm(SignupSchema, raw) returns FormResult<SignupFormInput, SignupData>
 * Keep only the FIRST message of each field.
 */
export function validateForm(schema: z.ZodType, input: unknown): any {
  return todo('A3');
}
