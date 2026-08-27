# Module E — Testing: Vitest & TDD

## Commands

| Command             | What it does                                  |
|---------------------|-----------------------------------------------|
| `npm test`          | run the suite once (CI mode)                   |
| `npm run test:watch`| watch mode — the loop to use during the labs   |
| `npm run coverage`  | run once + v8 coverage report (text + HTML)    |

Config: `vitest.config.ts`. Specs are `tests/**/*.spec.ts`.
There is no `globals: true` — every spec imports `describe` / `it` / `expect` / `vi`
from `vitest` explicitly, so nothing extra is needed in `tsconfig.json`.

## Walkthrough specs

| File                      | Covers                                                        |
|---------------------------|---------------------------------------------------------------|
| `01-matchers.spec.ts`     | anatomy of a test, `toBe` vs `toEqual` vs `toStrictEqual`, floats, throwing |
| `02-async.spec.ts`        | `await`, `resolves` / `rejects`, `expect.assertions`, fake timers |
| `03-mocks-spies.spec.ts`  | `vi.fn`, `vi.spyOn`, programmed return values, `vi.stubGlobal('fetch')` |
| `04-module-mock.spec.ts`  | `vi.mock` hoisting, `vi.mocked`, `vi.hoisted`, note on MSW    |

`tests/fixtures/` holds the small modules `04` mocks.

## Labs

`labs/E1-tdd-cart.spec.ts` — red / green / refactor on a shopping cart.
Remove `.skip` on the `describe`, run `npm run test:watch`, and make one test pass
at a time. The stub class lives in the same file so the loop stays tight.

## Jest ↔ Vitest

The API is deliberately near-identical: `jest.fn` → `vi.fn`, `jest.spyOn` → `vi.spyOn`,
`jest.mock` → `vi.mock`, `jest.useFakeTimers` → `vi.useFakeTimers`. The differences that
matter here: Vitest reuses the project's Vite config and its ESM/TS pipeline (no
`ts-jest`, no Babel), and mock functions are not auto-reset between tests unless you
turn on `clearMocks` / `restoreMocks` in the config or call `vi.clearAllMocks()` yourself.
