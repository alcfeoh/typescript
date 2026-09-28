# PXO — hands-on half-day (fil rouge)

One small vanilla TypeScript app with no framework, built with Vite. It has five pages: log in, sign up with an avatar upload, support chat, videos, and premium offers. The whole half-day happens in it. **There are no slides.** Every step is a change in the app, driven by tests that go from red to green.

| Time | Part | Steps | Main notions |
| --- | --- | --- | --- |
| 0:00 – 0:30 | **Tests** | T1 Vitest (10 min) · T2 Playwright (20 min) | fake timers, E2E, network mocking |
| 0:30 – 1:15 | **Case 1: Account** | A1 → A4 | Zod v4, generics, `ReturnType` / `Awaited` / `NonNullable` / `Parameters` |
| 1:15 – 2:10 | **Case 2: Chat** (the core) | C1 → C7 | `Extract`, `Exclude`, `infer`, conditional & distributive types, `never`, generic bus, `z.discriminatedUnion` |
| 2:10 – 2:50 | **Case 3: Videos** | M1 → M3 (M4, M5 if time allows) | templating, AVIF/JPEG `<picture>`, mixins, decorators, `infer` |
| 2:50 – 3:00 | Wrap-up | | |
| Fast finishers | **Bonus** | B1 · B2 · B3 | `KeysMatching`, exhaustiveness, recursive types & schemas |

## Setup (before the session)

```bash
cd pxo-filrouge
npm install
npx playwright install chromium   # ~150 MB download: do it before the session, not during
npm run dev                       # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | the app, with the fake back-end (`/api/login`, `/api/signup`, `/api/avatar`) |
| `npm run test:watch -- 2-chat` | runtime **and** type-level tests of one folder, in watch mode |
| `npm test` | every test, once |
| `npm run typecheck` | `tsc` on the whole project (app + tests) |
| `npm run e2e` / `npm run e2e:ui` | Playwright (it starts the dev server by itself) |

## How the exercises work

- **Every exercise is marked `TODO <step>`** in `src/`. `grep -rn "TODO C3" src` finds it.
- **Type placeholders are `any`.** Everything compiles, but nothing is checked. Your job is to replace them.
- **Function placeholders call `todo('C5')`.** That throws, and the page shows `⚠️ Exercise C5 is not done yet`.
- **Two kinds of tests:**
  - `*.spec.ts` files are run.
  - `*.test-d.ts` files are type-level tests. They are never run: Vitest passes them to `tsc` and turns each type error into a failed test. For example, `Expected: literal number 1, Actual: any` means your type is still `any`.
- **Starting point:** 79 failed · 8 passed · 4 todo. All green means the case is done.
- **Imports go through `@/`:** `@/chat/chat-bus` is `src/chat/chat-bus.ts`.

---

## Part 0 — Tests (30 min)

### T1 — Vitest warm-up: `tests/0-tests/typing-indicator.spec.ts`

**Code under test:** `src/chat/typing-indicator.ts`, used by the chat composer. It sends "typing…" on the first keystroke and "stopped" after 2 s of silence.

**Task:** the first test is written. Turn the four `it.todo` into real tests.

**Tools:** `vi.fn()`, `vi.useFakeTimers()`, `vi.advanceTimersByTime(ms)`, `toHaveBeenCalledTimes`, `toHaveBeenLastCalledWith`.

Side note on the code under test: `ReturnType<typeof setTimeout>` is the right type for a timer id in both Node and the browser.

### T2 — Playwright: `tests/e2e/login.e2e.ts`

**Demo (trainer):** walk through the first two tests.

- Locators by role and label: `getByLabel`, `getByRole`.
- Web-first assertions, which retry by themselves.
- `page.route()` to simulate a server error without touching the server.
- Also show `npm run e2e:ui` and `npx playwright codegen http://localhost:5173/#/login`.

**Task:** turn the three `test.fixme` into real tests.

- **T2.a:** an invalid e-mail shows `Invalid email`, and **no request** is sent. Count the calls in a `page.route` handler.
- **T2.b:** a wrong password shows `Invalid email or password` (the fake back-end answers 401).
- **T2.c:** the button is disabled while the request is pending.
  - Hold the route with a promise you resolve after the assertion, then call `route.continue()`.

**Demo accounts:**

- To log in: `demo@pxo.fr` / `correct-horse-battery-staple`.
- To sign up: that e-mail is "already registered" (409). Any other e-mail works.

---

## Case 1 — Account (45 min): sign-up, avatar upload

**Page:** `#/signup`, file `src/account/signup-page.ts` (pre-coded).
**Tests:** `tests/1-account/`

Compare with `src/account/login-page.ts`: it turns Zod issues into field errors by hand. A3 turns that into one generic function.

### A1 — `SignupSchema`: `src/account/account-schema.ts`

Three fields are done. Add the rest; the error messages are in the tests.

1. **`confirmPassword`**, then an **object-level `.refine`** that reports `Passwords do not match` on the `confirmPassword` field (`path`).
2. **`country`**: `z.enum(COUNTRY_CODES)`, with the error `Please pick a country`. `COUNTRY_CODES` comes from `as const` data (`src/shared/countries.ts`), so the type follows the data.
3. **`newsletter`**: a checked box sends `"on"`, an unchecked one sends **nothing**. Use `z.stringbool().default(false)`.
4. **`acceptTerms`**: required. Input `'on'`, output `true`. Use `z.literal` + `.transform`.
5. **E-mail normalisation**: `'  Alice@PXO.fr '` must become `'alice@pxo.fr'`.
   - ⚠️ `z.email().trim()` validates **before** trimming.
   - How do you trim first?

**Payoff:** `z.input` ≠ `z.output`. The form sends strings; the API receives a `CountryCode` and booleans. The test-d checks both types.

### A2 — `AvatarSchema` & `UploadSchema`

1. `z.file()` with at most 2 MB (`2 MB maximum`).
2. PNG / JPEG / WebP / AVIF only (`PNG, JPEG, WebP or AVIF only`).
3. An optional `caption` of at most 140 characters.

### A3 — `validateForm`, one generic for every form: `src/shared/form.ts`

1. `FieldErrors<T>`: one optional string per field.
   - `Record`, `Partial`, and `Extract<keyof T, string>`: why `string`?
2. `FormResult<In, Out>`: a discriminated union on `ok`.
3. Make `validateForm` generic on the **schema type** `S extends z.ZodType`, so that both types can be derived from it: `FormResult<z.input<S>, z.output<S>>`. Keep the first message of each field.

**Payoff:** `result.data.country` is a `CountryCode` in `signup-page.ts`, and the same function types the avatar form.

### A4 — Types derived from an API client you may not edit: `src/account/account-types.ts`

`account-api.ts` plays the role of a generated client: it does not export its types.

- `SignupResponse = Awaited<ReturnType<typeof signup>>`
- `Session = NonNullable<…>`
- `User = Session['user']`
- `UploadOptions`: the second parameter of `uploadAvatar`, without `undefined`. Use `Parameters` and `NonNullable`.

**Payoff:** run `npm run typecheck`. A bug appears in `src/account/welcome.ts` that `any` was hiding. Sign up in the app before and after fixing it.

---

## Case 2 — Chat (55 min)

**Page:** `#/chat`.
**Pre-coded:**

- `chat-events.ts`: the `ChatEvent` discriminated union, with ids as template literal types `usr_${string}`.
- `fake-server.ts`: a scripted server that sends **frames** (JSON batches), two of which are broken on purpose.
- `chat-page.ts`: the page.

**Tests:** `tests/2-chat/`. The page comes to life after C5 and C7.

### C1 — `ChatEventType`, `EventOf<K>`: `src/chat/chat-types.ts`

- `ChatEventType`: indexed access `ChatEvent['type']`.
- `EventOf<K>`: `Extract` of the member whose `type` is `K`.

### C2 — `PayloadOf<E>` and `EventWithoutPayload`

- `PayloadOf<E>`: a conditional type with `infer`. It must be `never` when there is no payload, and **distribute** over a union.
- `EventWithoutPayload`: distributivity used on purpose, since `never` disappears from a union. How is the built-in `Exclude` written?

### C3 — The bug in `Batch<E>`

It compiles, but the test-d fails with `not assignable to parameter of type 'never'` when you push a `typing` after a `message`.

- Why does `Batch<ChatEvent>` give `MessageEvent[] | TypingEvent[] | …`?
- Turn distribution off with `[E] extends [ChatEvent]`.

### C4 — `OutgoingEvent`

Everything except `system` and `ping`, which only the server sends. Use `Exclude`. It types `FakeChatServer.send()`.

### C5 — Generic bus: `src/chat/chat-bus.ts`

`on<K extends ChatEventType>(type: K, handler: (event: EventOf<K>) => void)`, plus `emit`.

- K is inferred from `'typing'`, and the handler receives the narrowed event.
- There is one unavoidable cast inside `emit`: where is it, and why is it safe?

### C6 — Reducer: `src/chat/chat-reducer.ts`

Handle `typing` (no duplicates), `read` (once per reader), `reaction` (count per emoji), `system` and `ping`, without mutating the state. Then replace `default: return state` with `return assertNever(event)`.

**Try it:**

1. Add a `{ type: 'delete'; payload: { messageId: MessageId } }` event to `ChatEvent`, then run `npm run typecheck`. The compiler lists every place to update: the reducer (`never`) and the Zod schema (C7).
2. Undo it.

### C7 — Validate at the boundary: `src/chat/chat-wire.ts`

- `ChatEventSchema = z.discriminatedUnion('type', [...])`. The ids use `z.templateLiteral(['usr_', z.string()])`, the emojis use `z.enum(EMOJIS)`.
- The test-d checks that `z.output<typeof ChatEventSchema>` is **exactly** `ChatEvent`: the Zod schema and the TypeScript type cannot drift apart.
- `parseWireFrame(raw)` never throws:
  - bad JSON or a non-array → `[]`
  - an invalid event → skipped with `console.warn`

**Payoff:** open the browser console on `#/chat`. The two broken frames from the server are dropped, and the chat keeps working.

---

## Case 3 — Videos (40 min)

**Page:** `#/media`.
**Pre-coded:**

- the `html` tag (Module B)
- the mixins `Playable`, `Seekable`, `Audible` (Module D)
- the `@logged` decorator
- `media-page.ts`

**Tests:** `tests/3-media/`. They run in `happy-dom`, a DOM implemented in Node.

### M1 — `mediaCard()`: `src/media/media-card.ts`

The expected markup is written in the comment:

- `<picture>` with an AVIF `<source>` and a JPEG `<img>` fallback
- `<video class="preview" muted loop playsinline preload="none">` with an MP4 source, then WebM if the media has one
- the title and duration

No JavaScript picks the format: the browser does.

Watch out: `alt=${title}` without quotes breaks at the first space.

**Where are the types?** `media-types.ts`: `AvifUrl = `${string}.avif``. Try swapping `avif` and `jpeg` in `CATALOG`.

### M2 — The `Previewable` mixin: `src/media/player.ts`

1. **Constraint:** this mixin calls `play()`, `pause()` and `seek()`. Constrain `TBase` (`Constructor<BasePlayer & …>`) so that `Previewable(BasePlayer)` does not compile.
2. **`startPreview()`:** mute, `seek(10 % of the duration)`, `play()`.
3. **`stopPreview()`:** pause, `seek(0)`, restore the sound as it was.
   - Use a `#private` field in the mixin.

**Payoff:** hovering a card plays its preview. The `@logged` lines in the console (Verbose level) show that `seek` and `play` go through the mixins.

### M3 — The `@clamp(min, max)` setter decorator: `src/shared/clamp.ts`

Standard decorators, with no `experimentalDecorators`.

- **Before:** click 🔊 at 100 %. `HTMLMediaElement.volume = 1.1` throws `IndexSizeError` (look at the console).
- **After:** the volume stays within `[0, 1]`.

### M4 (if time allows) — Keyboard shortcuts typed from the class: `src/media/player-remote.ts`

- `MethodKeys<T>`: a mapped type + conditional + `[keyof T]`. Getters such as `volume` drop out.
- `ArgsOf<T, K>`: with `infer`, because `Parameters<T[K]>` does not compile here. Why not?
- `Shortcut`: `['skip', 5]` ✅, `['skip', '5']` ❌, `['seek']` ❌.

### M5 (optional) — Playwright: `tests/e2e/media.e2e.ts`

Check what only a real browser can:

- the AVIF poster is the one picked (`img.currentSrc`)
- hovering plays the muted preview, and leaving pauses and rewinds it

---

## Bonus

- **B1 — `src/shared/search.ts`:** `KeysMatching<T, V>` and a generic `searchBy(items, key, query)`. `key` must be a string property. It is used by the country search of the sign-up form.
- **B2 — `src/premium/offers.ts`:**
  - `PaidOffer` with `Exclude`
  - `monthlyCost` and `priceLabel`, both exhaustive (`never`)
  - Page: `#/premium`.
- **B3 — `src/comments/comments.ts`:**
  - a recursive Zod schema, using a getter
  - `countNodes` / `flattenTree` generic on any tree: `T extends { replies: readonly T[] }`
  - The comments appear under the video player. The second video's thread contains an invalid reply, and the page says so.

---

## Trainer notes

**Solutions** are in `solutions/`, with the same paths as `src/` and `tests/`.

- In solution mode, `@/x` resolves to `solutions/x` when that file exists, and to `src/x` otherwise.
  - Vite plugin: `build/plugins.ts`.
  - `tsc`: `paths` in `solutions/tsconfig.json`.
- Useful commands:
  - `npm run dev:solution`: the finished app, on port 5174.
  - `npm run verify:solution`: typecheck, then every test (91 green), then Playwright (15 green).
  - To demo one step's solution: `diff src/chat/chat-types.ts solutions/chat/chat-types.ts`.

**Coverage of PXO's request:**

| Asked for | Where |
| --- | --- |
| Generics, varied uses | A3 (a schema-typed function, 2 derived type params), C5 (key → narrowed handler), M2 (constrained mixin), M4, B1 (`K extends KeysMatching<T, string>`), B3 (F-bounded `T extends { replies: T[] }`) |
| infer / conditional / distributive | C2 (`infer`, distribution), C3 (distribution as a bug, `[E]`), M4 (`ArgsOf`), B1 |
| Zod v4 | A1 (`refine`, `stringbool`, `enum`, `pipe`, input vs output), A2 (`z.file`), C7 (`discriminatedUnion`, `templateLiteral`, `prettifyError`), B3 (recursive getter) |
| Exclude / Extract / NonNullable / ReturnType / Parameters / Awaited / never | C4, B2 / C1, A3 / A4 / A4 / A4, M4 / A4 / C2, C6, B2 |
| Templating (pre-coded) | `html` tag (Module B) in every page, M1; template literal types (`usr_${string}`, `${string}.avif`) |
| Discriminated unions (pre-coded) | `ChatEvent`, `Offer`, `FormResult` |
| Mixins + decorators (pre-coded) | `Playable` / `Seekable` / `Audible`, `@logged`; M2, M3 to write |

**Things that will come up:**

- **Standard decorators & Vite 8.** Vite 8 compiles TS with Oxc, which only lowers legacy decorators.
  - `build/plugins.ts` (`standardDecorators`) runs `ts.transpileModule` on files that contain a decorator.
  - This answers "who compiles what?".
- **`z.email().trim()`** validates before trimming. Normalise first: `z.string().trim().toLowerCase().pipe(z.email())`.
- **`Intl.NumberFormat('fr-FR')`** puts a narrow no-break space (U+202F) before `€`. The B2 test normalises spaces.
- **`preload="none"`** means `duration` is `NaN` until metadata loads. `Seekable.seek` falls back to 0; setting `currentTime = NaN` throws.
- **Playwright's Chromium and H.264.** Checked with Playwright 1.63: its Chromium plays the MP4 (H.264) preview. Older Playwright builds of the open-source Chromium did not. The `<video>` lists a WebM source as a fallback either way.
