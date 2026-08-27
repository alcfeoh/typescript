/** A dependency we want to replace in tests: it is non-deterministic. */
export function now(): Date {
  return new Date();
}
