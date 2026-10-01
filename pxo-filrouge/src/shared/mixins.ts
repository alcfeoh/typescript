// Déjà codé — Module D (mixins).

/**
 * Tout ce qu'on peut appeler avec `new` et qui produit un T.
 * TypeScript exige que le constructeur de base d'un mixin accepte `...args: any[]`.
 */
export type Constructor<T = object> = new (...args: any[]) => T;
