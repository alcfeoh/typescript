// Pre-coded — Module D (mixins).

/**
 * Anything you can call `new` on and that produces a T.
 * TypeScript requires a mixin's base constructor to take `...args: any[]`.
 */
export type Constructor<T = object> = new (...args: any[]) => T;
