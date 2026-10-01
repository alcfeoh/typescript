// Solution — B1.

// Un mapped type qui garde K quand T[K] est un V, et `never` sinon,
// puis indexé par keyof T pour réunir les clés restantes en une union.
export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export function searchBy<T, K extends KeysMatching<T, string>>(items: readonly T[], key: K, query: string): T[] {
  const needle = normalize(query);
  // TypeScript ne sait pas que T[K] est une chaîne (KeysMatching est un type conditionnel),
  // d'où String(…) plutôt qu'un cast.
  return items.filter((item) => normalize(String(item[key])).includes(needle));
}

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}
