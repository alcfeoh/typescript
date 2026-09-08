/**
 * A type-safe wrapper around one key of the browser's localStorage.
 *
 * This is the class you wrote in LAB G1 (Generics). Nothing about it changes
 * here — the exercise is turning it into something other people can install.
 */

/**
 * We use exactly three methods of the browser's Storage API. Declaring them
 * ourselves means this library does not need "lib": ["DOM"] in its tsconfig,
 * so it never leaks DOM types into a consumer who does not want them.
 */
interface WebStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

declare const localStorage: WebStorageLike;

export class Storage<T> {
  constructor(private readonly key: string) {}

  /** Serialise `value` and store it under this instance's key. */
  save(value: T): void {
    localStorage.setItem(this.key, JSON.stringify(value));
  }

  /** Read the value back, or null if nothing was ever saved under this key. */
  load(): T | null {
    const raw = localStorage.getItem(this.key);
    return raw === null ? null : (JSON.parse(raw) as T);
  }

  /** Remove the key entirely. */
  delete(): void {
    localStorage.removeItem(this.key);
  }
}
