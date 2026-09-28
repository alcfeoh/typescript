# PXO — fil rouge : notes du formateur

Ce document accompagne `README.md`, qui est le support des stagiaires (contexte, consignes, commandes). Ici : la préparation, le déroulé minuté, la réponse attendue et les pièges de chaque étape, le mode solution, et les points techniques qui vont sortir en séance.

**Public :** le même groupe que la formation TypeScript avancé de 2 jours. La demi-journée sert à **pratiquer** : pas de nouvelles slides, les notions ont déjà été vues.

## Avant la session

**Sur votre machine :**

```bash
cd pxo-filrouge
npm install
npx playwright install chromium
npm run verify:solution   # typecheck, 91 tests Vitest, 15 tests Playwright : tout doit être vert
npm test                  # état de départ : 79 en échec · 8 qui passent · 4 à écrire (c'est voulu)
```

**Côté stagiaires** (à leur envoyer la veille) : cloner la branche `bonus-pxo-filrouge`, puis `npm install` et `npx playwright install chromium` (~150 Mo). Vérifier que `npm run dev` affiche l'app sur http://localhost:5173.

## Le mode solution

Les solutions sont dans `solutions/`, avec les mêmes chemins que `src/` et `tests/`. Tous les imports passent par l'alias `@/`. En mode solution, `@/x` pointe vers `solutions/x` quand ce fichier existe, et vers `src/x` sinon.

- Côté Vite : plugin `exerciseResolver` dans `build/plugins.ts`.
- Côté `tsc` : `paths` à deux entrées dans `solutions/tsconfig.json`.

| Commande | Usage |
| --- | --- |
| `npm run dev:solution` | l'app terminée, sur le port 5174 (en parallèle de l'app des stagiaires) |
| `npm run ex:solution C3` | les tests d'une étape, contre sa solution |
| `npm run verify:solution` | tout vérifier avant la session |
| `diff src/chat/chat-types.ts solutions/chat/chat-types.ts` | montrer la solution d'une étape |

Les solutions sont commentées : chaque fichier explique **pourquoi** la réponse s'écrit ainsi. On peut les projeter telles quelles pendant la correction.

## Déroulé minuté

| Horaire | Étape | Durée | Format |
| --- | --- | --- | --- |
| 0:00 | Présentation de l'app (`npm run dev`, les 5 pages, l'arborescence) | 5 min | démo |
| 0:05 | T1 — Vitest, fausses horloges | 10 min | exercice |
| 0:15 | T2 — Playwright | 15 min | 7 min de démo + 8 min d'exercice |
| 0:30 | A1 → A4 — Compte | 45 min | 15 + 5 + 15 + 10 |
| 1:15 | C1 → C7 — Chat | 55 min | 5 + 8 + 8 + 3 + 12 + 9 + 10 |
| 2:10 | M1 → M3 — Vidéos (M4, M5 si le temps le permet) | 40 min | 10 + 15 + 10 (+ 5 de marge) |
| 2:50 | Bilan | 10 min | tour de table |

Les bonus B1–B3 occupent ceux qui avancent plus vite ; ils ne sont pas corrigés collectivement.

**Conseil :** faire une correction collective courte à la fin de chaque cas (Compte, Chat, Vidéos), en projetant le `diff` avec la solution. Si le Cas 2 déborde, sacrifier C4 (le plus simple) et C7 plutôt que C3 et C5, qui portent le cœur de la demande (distributivité, génériques).

## Étape par étape : réponse attendue et pièges

### T1 — `solutions/tests/0-tests/typing-indicator.spec.ts`

- **Réponse :** `vi.useFakeTimers()` dans un `beforeEach`, puis `vi.advanceTimersByTime(1999)` / `(1)` pour prouver le délai exact.
- **Pièges :**
  - `toHaveBeenCalledWith(false)` passe même si l'appel n'est pas le dernier : préférer `toHaveBeenLastCalledWith`.
  - Oublier `vi.useRealTimers()` dans `afterEach` pollue les autres tests du fichier.

### T2 — `solutions/tests/e2e/T2-login.e2e.ts`

- **À montrer pendant la démo :** `getByLabel` / `getByRole` plutôt que des sélecteurs CSS, l'absence de `waitForTimeout` grâce aux assertions qui réessaient, `page.route` pour simuler le serveur, `npm run e2e:ui` et `codegen`.
- **Réponse T2.c :** retenir la route avec une promesse résolue après l'assertion `toBeDisabled()`, puis `route.continue()`.
- **Pièges :**
  - `getByText('Invalid email')` trouve aussi « Invalid email or password » : utiliser `{ exact: true }`.
  - Le `page.route` doit être posé **avant** le clic.

### A1 — `solutions/account/account-schema.ts`

- **Réponse :** `.refine` sur l'objet avec `path: ['confirmPassword']` ; `z.enum(COUNTRY_CODES)` ; `z.stringbool().default(false)` ; `z.literal('on').transform(() => true as const)` ; `z.string().trim().toLowerCase().pipe(z.email())`.
- **Pièges :**
  - `z.email().trim()` valide **avant** de trimer : `'  a@b.fr '` est refusé. C'est le point le plus instructif de l'étape.
  - Sans `.default(false)`, une case non cochée (champ absent) est une erreur.
  - `as const` sur le `transform` : sans lui, le type de sortie est `boolean` et le test-d échoue.

### A2 — `solutions/account/account-schema.ts`

- **Réponse :** `z.file().max(2 * 1024 * 1024).mime([...])` et `caption: z.string().max(140).optional()`.
- **Piège :** `.max()` sur un `z.file()` compte des **octets**.

### A3 — `solutions/shared/form.ts`

- **Réponse :** `validateForm<S extends z.ZodType>(schema: S, input: unknown): FormResult<z.input<S>, z.output<S>>`.
- **Points à discuter :**
  - Pourquoi rendre générique le **schéma** plutôt que la donnée (`validateForm<T>`) : un seul paramètre de type, deux types dérivés (entrée et sortie).
  - Pourquoi `Extract<keyof T, string>` : `keyof` peut inclure `number` et `symbol`.
  - Le cast `field as Extract<keyof z.input<S>, string>` est inévitable : Zod type les chemins d'erreur en `PropertyKey[]`.
- **Piège :** tant que A2 n'est pas fait, `signup-page.ts` ne compile plus (`result.data.caption` n'existe pas). C'est normal, et c'est la preuve que le générique fonctionne.

### A4 — `solutions/account/account-types.ts`

- **Réponse :** `Awaited<ReturnType<typeof signup>>`, `NonNullable<SignupResponse>`, `Session['user']`, `NonNullable<Parameters<typeof uploadAvatar>[1]>`.
- **Le moment fort :** `npm run typecheck` révèle `session.user.name` dans `welcome.ts` (la propriété s'appelle `displayName`). Faire constater dans l'app : « Welcome, ! » avant, « Welcome, Alice! » après.
- **Piège :** oublier `NonNullable` sur `Parameters<…>[1]` : un paramètre optionnel inclut `undefined`.

### C1 à C4 — `solutions/chat/chat-types.ts`

- **C1 :** `ChatEvent['type']` et `Extract<ChatEvent, { type: K }>`.
- **C2 :** `E extends { payload: infer P } ? P : never`. Faire remarquer que `PayloadOf<ChatEvent>` donne l'union des payloads **parce que** `E` est un paramètre « nu ». `EventWithoutPayload` est la définition même de `Exclude`.
- **C3 :** `[E] extends [ChatEvent] ? E[] : never`.
  - Faire lire le message d'erreur du test avant d'expliquer : `push` sur `A[] | B[]` attend `A & B`, c'est-à-dire `never`.
  - Question à poser : « quand veut-on la distribution, quand est-ce un bug ? »
- **C4 :** `Exclude<ChatEvent, { type: 'system' | 'ping' }>`.

### C5 — `solutions/chat/chat-bus.ts`

- **Réponse :** `on<K extends ChatEventType>(type: K, handler: (event: EventOf<K>) => void)`, stockage `Map<ChatEventType, Set<Handler<never>>>`.
- **Point à discuter :** le seul cast est dans `emit`. Il est sûr parce que `on` est la seule porte d'entrée de la `Map`, mais TypeScript ne peut pas suivre ce lien. C'est l'occasion de parler de contravariance des paramètres (`Handler<X>` est assignable à `Handler<never>`).
- **Piège :** typer le stockage en `Handler<ChatEvent>` oblige à caster dès `on`.

### C6 — `solutions/chat/chat-reducer.ts`

- **Réponse :** un `case` par type, spread partout, `default: return assertNever(event)`.
- **Démonstration :** ajouter l'événement `delete` à `ChatEvent` et lancer `npm run typecheck` : le compilateur pointe le reducer **et** le test-d de C7.
- **Piège :** muter `state.typing.push(...)` : le test « never mutates the previous state » le détecte.

### C7 — `solutions/chat/chat-wire.ts`

- **Réponse :** `z.discriminatedUnion('type', [...])`, identifiants en `z.templateLiteral(['usr_', z.string()])`, emojis en `z.enum(EMOJIS)`, `safeParse` par événement, `z.prettifyError` pour le `console.warn`.
- **Pièges :**
  - `z.string()` pour un identifiant : le schéma accepte les mauvaises valeurs, et son type (`string`) ne correspond plus à `ChatEvent`. Le test-d « outputs exactly ChatEvent » échoue, c'est voulu.
  - Oublier `ping` (objet sans `payload`) : même symptôme.
- **À faire constater :** la console du navigateur sur `#/chat` montre les deux frames cassées écartées.

### M1 — `solutions/media/media-card.ts`

- **Réponse :** le gabarit du commentaire, avec **tous les attributs entre guillemets**, et `${preview.webm && html`…`}` pour la source optionnelle.
- **Pièges :**
  - `alt=${title}` sans guillemets : le titre « Zod 4 & <forms> — … » casse le HTML. Le tag `html` échappe les guillemets à l'intérieur de la valeur, les guillemets autour sont donc sûrs.
  - Chercher à détecter le support AVIF en JavaScript : `<picture>` le fait déjà.

### M2 — `solutions/media/player.ts`

- **Réponse :** `TBase extends Constructor<BasePlayer & PlaybackControls>`, un champ `#wasMuted`, et des appels à `this.seek()` / `this.play()`.
- **Piège :** écrire `this.video.currentTime = …` au lieu de `this.seek(…)`. Ça fonctionne, mais la contrainte perd sa raison d'être, et le test qui vérifie les lignes de `@logged` échoue.

### M3 — `solutions/shared/clamp.ts`

- **Réponse :** retourner `function (this: This, value: number) { setter.call(this, Math.min(max, Math.max(min, value))) }`.
- **Piège :** une fonction fléchée perd `this`.

### M4 — `solutions/media/player-remote.ts`

- **Réponse :**
  - `MethodKeys<T> = { [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never }[keyof T]`
  - `ArgsOf<T, K> = T[K] extends (...args: infer A) => unknown ? A : never`
  - `Shortcut = { [C in PlayerCommand]: [C, ...ArgsOf<VideoPlayer, C>] }[PlayerCommand]`
- **Point à discuter :** `Parameters<T[K]>` échoue parce que sa contrainte `(...args: any) => any` ne peut pas être prouvée pour `T[K]` ; écrire le conditionnel soi-même n'a pas cette contrainte.

### M5 — `solutions/tests/e2e/M5-media.e2e.ts`

- **Réponse :** `expect.poll(() => img.evaluate((i) => i.currentSrc)).toMatch(/\.avif$/)`, puis `hover()` et `page.mouse.move(0, 0)` pour l'aperçu.

### Bonus B1 – B3

Solutions dans `solutions/shared/search.ts`, `solutions/premium/offers.ts` et `solutions/comments/comments.ts`. Points notables :

- **B1 :** le `-?` de `KeysMatching` évite que les propriétés optionnelles ajoutent `undefined` à l'union des clés.
- **B2 :** `priceLabel` n'a pas de `default` : quand tous les cas retournent, un cas manquant devient l'erreur « Function lacks ending return statement ».
- **B3 :** le getter `get replies()` retarde la référence au schéma, qui n'existe pas encore au moment où on l'écrit.

## Couverture de la demande de PXO

| Demandé | Où |
| --- | --- |
| Tests unitaires (Jest / Vitest), Playwright | T1, T2, M5 |
| Génériques, cas d'usage variés | A3 (fonction typée par un schéma, 2 paramètres de type dérivés), C5 (clé → handler affiné), M2 (mixin contraint), M4, B1 (`K extends KeysMatching<T, string>`), B3 (F-bounded `T extends { replies: T[] }`) |
| infer / conditional / distributive | C2 (`infer`, distribution), C3 (la distribution comme bug, `[E]`), M4 (`ArgsOf`), B1 |
| Zod v4 | A1 (`refine`, `stringbool`, `enum`, `pipe`, entrée vs sortie), A2 (`z.file`), C7 (`discriminatedUnion`, `templateLiteral`, `prettifyError`), B3 (getter récursif) |
| Exclude / Extract / NonNullable / ReturnType / Parameters / Awaited / never | C4, B2 / C1, A3 / A4 / A4 / A4, M4 / A4 / C2, C6, B2 |
| Templating (déjà codé) | tag `html` (Module B) dans toutes les pages, M1 ; template literal types (`usr_${string}`, `${string}.avif`) |
| Unions discriminées (déjà codées) | `ChatEvent`, `Offer`, `FormResult` |
| Mixins + décorateurs (déjà codés) | `Playable` / `Seekable` / `Audible`, `@logged` ; M2 et M3 à écrire |
| Applications de PXO | chat (Cas 2), création de compte / connexion (T2, Cas 1), upload (A2), lecteur vidéo et image AVIF/JPEG avec aperçu mp4 (Cas 3), sélecteur de pays (B1), offre premium (B2), commentaires (B3) |

**Jest ou Vitest :** PXO a écrit « Jest ». Le repo utilise Vitest ; l'API est quasi identique (`jest.fn` → `vi.fn`, `jest.useFakeTimers` → `vi.useFakeTimers`). Le dire dès T1.

## Points techniques qui vont sortir en séance

- **Décorateurs standards et Vite 8.** Vite 8 compile le TypeScript avec Oxc, qui ne sait transformer que les décorateurs legacy (`experimentalDecorators`). `build/plugins.ts` (`standardDecorators`) passe donc `ts.transpileModule` sur les fichiers qui contiennent un décorateur, avant Oxc. Bonne occasion de répondre à « qui compile quoi ? ».
- **Tests de types.** Vitest (`typecheck.enabled` dans `vite.config.ts`) lance `tsc` sur les fichiers `*.test-d.ts` et rattache chaque erreur au test qui la contient. Un `// @ts-expect-error` inutilisé est aussi une erreur : c'est ainsi qu'on teste qu'un code **ne compile pas**.
- **`Intl.NumberFormat('fr-FR')`** met une espace fine insécable (U+202F) avant `€`. Le test de B2 normalise les espaces.
- **`preload="none"`** : `duration` vaut `NaN` tant que les métadonnées ne sont pas chargées. `Seekable.seek` se replie sur 0 ; affecter `currentTime = NaN` lève une erreur.
- **Le Chromium de Playwright et le H.264.** Vérifié avec Playwright 1.63 : son Chromium lit l'aperçu MP4 (H.264). Les anciennes versions de Playwright, basées sur le Chromium open source, ne le lisaient pas. Le `<video>` propose de toute façon une source WebM en repli.
- **Le repo racine.** `tsconfig.build.json` exclut `pxo-filrouge`. Le `tsconfig.json` racine, lui, l'inclut encore : sur cette branche, le vérificateur de types du `npm run dev` racine voit aussi les fichiers du fil rouge.
