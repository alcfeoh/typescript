// Solution — B1.

// A mapped type that keeps K when T[K] is a V, and `never` otherwise,
// then indexed by keyof T to collect the surviving keys into a union.
export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export function searchBy<T, K extends KeysMatching<T, string>>(items: readonly T[], key: K, query: string): T[] {
  const needle = normalize(query);
  // T[K] is not known to be a string by TypeScript (KeysMatching is a conditional type),
  // hence String(…) rather than a cast.
  return items.filter((item) => normalize(String(item[key])).includes(needle));
}

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}
