// The library talks to the browser's localStorage. Node has no such global,
// so we install a tiny in-memory stand-in before importing the package.
// (That the library needs this at all is itself worth noticing.)
const memory = new Map();
globalThis.localStorage = {
  getItem: (k) => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => void memory.set(k, String(v)),
  removeItem: (k) => void memory.delete(k),
};
