# PXO — demi-journée pratique (fil rouge)

Une petite application TypeScript vanilla, sans framework, construite avec Vite. Elle a cinq pages : connexion, inscription avec upload d'avatar, chat de support, vidéos et offres premium. Toute la demi-journée se passe dedans. **Il n'y a pas de slides.** Chaque étape est une modification de l'app, guidée par des tests qui passent du rouge au vert.

| Horaire | Partie | Étapes | Notions principales |
| --- | --- | --- | --- |
| 0:00 – 0:30 | **Tests** | T1 Vitest (10 min) · T2 Playwright (20 min) | fake timers, E2E, mock réseau |
| 0:30 – 1:15 | **Cas 1 : Compte** | A1 → A4 | Zod v4, génériques, `ReturnType` / `Awaited` / `NonNullable` / `Parameters` |
| 1:15 – 2:10 | **Cas 2 : Chat** (le cœur) | C1 → C7 | `Extract`, `Exclude`, `infer`, types conditionnels et distributifs, `never`, bus générique, `z.discriminatedUnion` |
| 2:10 – 2:50 | **Cas 3 : Vidéos** | M1 → M3 (M4, M5 s'il reste du temps) | templating, `<picture>` AVIF/JPEG, mixins, décorateurs, `infer` |
| 2:50 – 3:00 | Bilan | | |
| Pour les plus rapides | **Bonus** | B1 · B2 · B3 | `KeysMatching`, exhaustivité, types et schémas récursifs |

## Installation (avant la session)

```bash
cd pxo-filrouge
npm install
npx playwright install chromium   # ~150 Mo à télécharger : à faire avant la session, pas pendant
npm run dev                       # http://localhost:5173
```

| Commande | Ce qu'elle fait |
| --- | --- |
| `npm run dev` | l'app, avec le faux back-end (`/api/login`, `/api/signup`, `/api/avatar`) |
| `npm run test:watch -- 2-chat` | les tests d'exécution **et** de types d'un dossier, en mode watch |
| `npm test` | tous les tests, une fois |
| `npm run typecheck` | `tsc` sur tout le projet (app + tests) |
| `npm run e2e` / `npm run e2e:ui` | Playwright (il démarre le serveur de dev tout seul) |

## Comment fonctionnent les exercices

- **Chaque exercice est marqué `TODO <étape>`** dans `src/`. `grep -rn "TODO C3" src` le retrouve.
- **Les types à écrire valent `any` au départ.** Tout compile, mais rien n'est vérifié. Votre travail : les remplacer.
- **Les fonctions à écrire appellent `todo('C5')`.** Cela lève une erreur, et la page affiche `⚠️ Exercise C5 is not done yet`.
- **Deux sortes de tests :**
  - les fichiers `*.spec.ts` sont exécutés ;
  - les fichiers `*.test-d.ts` sont des tests de types. Ils ne sont jamais exécutés : Vitest les passe à `tsc` et transforme chaque erreur de type en test échoué. Par exemple, `Expected: literal number 1, Actual: any` veut dire que votre type vaut encore `any`.
- **Point de départ :** 79 en échec · 8 qui passent · 4 à écrire. Tout vert veut dire que le cas est terminé.
- **Les imports passent par `@/` :** `@/chat/chat-bus` désigne `src/chat/chat-bus.ts`.

---

## Partie 0 — Tests (30 min)

### T1 — Échauffement Vitest : `tests/0-tests/typing-indicator.spec.ts`

**Code testé :** `src/chat/typing-indicator.ts`, utilisé par la zone de saisie du chat. Il envoie « en train d'écrire… » à la première frappe, et « a arrêté » après 2 s sans frappe.

**Consigne :** le premier test est écrit. Transformez les quatre `it.todo` en vrais tests.

**Outils :** `vi.fn()`, `vi.useFakeTimers()`, `vi.advanceTimersByTime(ms)`, `toHaveBeenCalledTimes`, `toHaveBeenLastCalledWith`.

Remarque sur le code testé : `ReturnType<typeof setTimeout>` est le bon type pour l'identifiant d'un timer, à la fois dans Node et dans le navigateur.

### T2 — Playwright : `tests/e2e/login.e2e.ts`

**Démo (formateur) :** dérouler les deux premiers tests.

- Locators par rôle et par label : `getByLabel`, `getByRole`.
- Assertions « web-first », qui réessaient toutes seules.
- `page.route()` pour simuler une erreur serveur sans toucher au serveur.
- Montrer aussi `npm run e2e:ui` et `npx playwright codegen http://localhost:5173/#/login`.

**Consigne :** transformez les trois `test.fixme` en vrais tests.

- **T2.a :** un e-mail invalide affiche `Invalid email`, et **aucune requête** n'est envoyée. Comptez les appels dans un handler `page.route`.
- **T2.b :** un mauvais mot de passe affiche `Invalid email or password` (le faux back-end répond 401).
- **T2.c :** le bouton est désactivé pendant que la requête est en cours.
  - Retenez la route avec une promesse que vous résolvez après l'assertion, puis appelez `route.continue()`.

**Comptes de démo :**

- Pour se connecter : `demo@pxo.fr` / `correct-horse-battery-staple`.
- Pour s'inscrire : cet e-mail est « déjà enregistré » (409). N'importe quel autre e-mail fonctionne.

---

## Cas 1 — Compte (45 min) : inscription, upload d'avatar

**Page :** `#/signup`, fichier `src/account/signup-page.ts` (déjà codé).
**Tests :** `tests/1-account/`

Comparez avec `src/account/login-page.ts` : il transforme à la main les issues Zod en erreurs par champ. A3 en fait une seule fonction générique.

### A1 — `SignupSchema` : `src/account/account-schema.ts`

Trois champs sont faits. Ajoutez les autres ; les messages d'erreur attendus sont dans les tests.

1. **`confirmPassword`**, puis un **`.refine` au niveau de l'objet** qui signale `Passwords do not match` sur le champ `confirmPassword` (`path`).
2. **`country`** : `z.enum(COUNTRY_CODES)`, avec l'erreur `Please pick a country`. `COUNTRY_CODES` vient de données `as const` (`src/shared/countries.ts`) : le type suit les données.
3. **`newsletter`** : une case cochée envoie `"on"`, une case non cochée n'envoie **rien**. Utilisez `z.stringbool().default(false)`.
4. **`acceptTerms`** : obligatoire. Entrée `'on'`, sortie `true`. Utilisez `z.literal` + `.transform`.
5. **Normalisation de l'e-mail** : `'  Alice@PXO.fr '` doit devenir `'alice@pxo.fr'`.
   - ⚠️ `z.email().trim()` valide **avant** de trimer.
   - Comment trimer d'abord ?

**Ce que ça apporte :** `z.input` ≠ `z.output`. Le formulaire envoie des chaînes ; l'API reçoit un `CountryCode` et des booléens. Le test-d vérifie les deux types.

### A2 — `AvatarSchema` et `UploadSchema`

1. `z.file()` de 2 Mo maximum (`2 MB maximum`).
2. PNG / JPEG / WebP / AVIF uniquement (`PNG, JPEG, WebP or AVIF only`).
3. Une `caption` optionnelle de 140 caractères maximum.

### A3 — `validateForm`, un seul générique pour tous les formulaires : `src/shared/form.ts`

1. `FieldErrors<T>` : une chaîne optionnelle par champ.
   - `Record`, `Partial`, et `Extract<keyof T, string>` : pourquoi `string` ?
2. `FormResult<In, Out>` : une union discriminée sur `ok`.
3. Rendez `validateForm` générique sur le **type du schéma** `S extends z.ZodType`, pour pouvoir en dériver les deux types : `FormResult<z.input<S>, z.output<S>>`. Gardez le premier message de chaque champ.

**Ce que ça apporte :** `result.data.country` est un `CountryCode` dans `signup-page.ts`, et la même fonction type le formulaire d'avatar.

### A4 — Des types dérivés d'un client d'API qu'on ne peut pas modifier : `src/account/account-types.ts`

`account-api.ts` joue le rôle d'un client généré : il n'exporte pas ses types.

- `SignupResponse = Awaited<ReturnType<typeof signup>>`
- `Session = NonNullable<…>`
- `User = Session['user']`
- `UploadOptions` : le second paramètre de `uploadAvatar`, sans `undefined`. Utilisez `Parameters` et `NonNullable`.

**Ce que ça apporte :** lancez `npm run typecheck`. Un bug que `any` cachait apparaît dans `src/account/welcome.ts`. Inscrivez-vous dans l'app avant et après la correction.

---

## Cas 2 — Chat (55 min)

**Page :** `#/chat`.
**Déjà codé :**

- `chat-events.ts` : l'union discriminée `ChatEvent`, avec des identifiants en template literal types `usr_${string}` ;
- `fake-server.ts` : un faux serveur scripté qui envoie des **frames** (des lots d'événements en JSON), dont deux sont volontairement cassées ;
- `chat-page.ts` : la page.

**Tests :** `tests/2-chat/`. La page prend vie après C5 et C7.

### C1 — `ChatEventType`, `EventOf<K>` : `src/chat/chat-types.ts`

- `ChatEventType` : accès indexé `ChatEvent['type']`.
- `EventOf<K>` : `Extract` du membre dont le `type` vaut `K`.

### C2 — `PayloadOf<E>` et `EventWithoutPayload`

- `PayloadOf<E>` : un type conditionnel avec `infer`. Il doit valoir `never` quand il n'y a pas de payload, et **se distribuer** sur une union.
- `EventWithoutPayload` : la distributivité utilisée exprès, puisque `never` disparaît d'une union. Comment le `Exclude` natif est-il écrit ?

### C3 — Le bug de `Batch<E>`

Il compile, mais le test-d échoue avec `not assignable to parameter of type 'never'` quand on ajoute un `typing` après un `message`.

- Pourquoi `Batch<ChatEvent>` donne-t-il `MessageEvent[] | TypingEvent[] | …` ?
- Coupez la distribution avec `[E] extends [ChatEvent]`.

### C4 — `OutgoingEvent`

Tout sauf `system` et `ping`, que seul le serveur envoie. Utilisez `Exclude`. Il type `FakeChatServer.send()`.

### C5 — Bus générique : `src/chat/chat-bus.ts`

`on<K extends ChatEventType>(type: K, handler: (event: EventOf<K>) => void)`, plus `emit`.

- K est inféré depuis `'typing'`, et le handler reçoit l'événement déjà affiné (narrowed).
- Il reste un cast inévitable dans `emit` : où, et pourquoi est-il sûr ?

### C6 — Reducer : `src/chat/chat-reducer.ts`

Gérez `typing` (sans doublons), `read` (une fois par lecteur), `reaction` (compte par emoji), `system` et `ping`, sans muter l'état. Remplacez ensuite `default: return state` par `return assertNever(event)`.

**À essayer :**

1. Ajoutez un événement `{ type: 'delete'; payload: { messageId: MessageId } }` à `ChatEvent`, puis lancez `npm run typecheck`. Le compilateur liste tous les endroits à mettre à jour : le reducer (`never`) et le schéma Zod (C7).
2. Annulez la modification.

### C7 — Valider à la frontière : `src/chat/chat-wire.ts`

- `ChatEventSchema = z.discriminatedUnion('type', [...])`. Les identifiants utilisent `z.templateLiteral(['usr_', z.string()])`, les emojis `z.enum(EMOJIS)`.
- Le test-d vérifie que `z.output<typeof ChatEventSchema>` est **exactement** `ChatEvent` : le schéma Zod et le type TypeScript ne peuvent pas diverger.
- `parseWireFrame(raw)` ne lève jamais d'erreur :
  - JSON invalide ou pas un tableau → `[]`
  - un événement invalide → ignoré, avec un `console.warn`

**Ce que ça apporte :** ouvrez la console du navigateur sur `#/chat`. Les deux frames cassées du serveur sont écartées, et le chat continue de fonctionner.

---

## Cas 3 — Vidéos (40 min)

**Page :** `#/media`.
**Déjà codé :**

- le tag `html` (Module B) ;
- les mixins `Playable`, `Seekable`, `Audible` (Module D) ;
- le décorateur `@logged` ;
- `media-page.ts`.

**Tests :** `tests/3-media/`. Ils tournent dans `happy-dom`, un DOM implémenté en Node.

### M1 — `mediaCard()` : `src/media/media-card.ts`

Le HTML attendu est écrit dans le commentaire :

- `<picture>` avec une `<source>` AVIF et un `<img>` JPEG en repli ;
- `<video class="preview" muted loop playsinline preload="none">` avec une source MP4, puis WebM si le média en a une ;
- le titre et la durée.

Aucun JavaScript ne choisit le format : c'est le navigateur qui décide.

Attention : `alt=${title}` sans guillemets s'arrête au premier espace.

**Où sont les types ?** Dans `media-types.ts` : `AvifUrl = `${string}.avif``. Essayez d'inverser `avif` et `jpeg` dans `CATALOG`.

### M2 — Le mixin `Previewable` : `src/media/player.ts`

1. **Contrainte :** ce mixin appelle `play()`, `pause()` et `seek()`. Contraignez `TBase` (`Constructor<BasePlayer & …>`) pour que `Previewable(BasePlayer)` ne compile pas.
2. **`startPreview()` :** couper le son, `seek(10 % de la durée)`, `play()`.
3. **`stopPreview()` :** pause, `seek(0)`, remettre le son comme avant.
   - Utilisez un champ `#privé` dans le mixin.

**Ce que ça apporte :** survoler une carte lance son aperçu. Les lignes `@logged` dans la console (niveau Verbose) montrent que `seek` et `play` passent bien par les mixins.

### M3 — Le décorateur de setter `@clamp(min, max)` : `src/shared/clamp.ts`

Décorateurs standards, sans `experimentalDecorators`.

- **Avant :** cliquez sur 🔊 à 100 %. `HTMLMediaElement.volume = 1.1` lève une `IndexSizeError` (regardez la console).
- **Après :** le volume reste dans `[0, 1]`.

### M4 (s'il reste du temps) — Raccourcis clavier typés à partir de la classe : `src/media/player-remote.ts`

- `MethodKeys<T>` : un mapped type + un conditionnel + `[keyof T]`. Les getters comme `volume` sont éliminés.
- `ArgsOf<T, K>` : avec `infer`, car `Parameters<T[K]>` ne compile pas ici. Pourquoi ?
- `Shortcut` : `['skip', 5]` ✅, `['skip', '5']` ❌, `['seek']` ❌.

### M5 (optionnel) — Playwright : `tests/e2e/media.e2e.ts`

Vérifier ce que seul un vrai navigateur peut vérifier :

- c'est bien le poster AVIF qui est choisi (`img.currentSrc`) ;
- le survol lance l'aperçu sans le son, et le quitter le met en pause et le rembobine.

---

## Bonus

- **B1 — `src/shared/search.ts` :** `KeysMatching<T, V>` et un `searchBy(items, key, query)` générique. `key` doit être une propriété de type chaîne. Il sert à la recherche de pays du formulaire d'inscription.
- **B2 — `src/premium/offers.ts` :**
  - `PaidOffer` avec `Exclude` ;
  - `monthlyCost` et `priceLabel`, tous deux exhaustifs (`never`) ;
  - page : `#/premium`.
- **B3 — `src/comments/comments.ts` :**
  - un schéma Zod récursif, avec un getter ;
  - `countNodes` / `flattenTree` génériques sur n'importe quel arbre : `T extends { replies: readonly T[] }` ;
  - les commentaires s'affichent sous le lecteur vidéo. Le fil de la deuxième vidéo contient une réponse invalide, et la page le signale.

---

## Notes formateur

**Les solutions** sont dans `solutions/`, avec les mêmes chemins que `src/` et `tests/`.

- En mode solution, `@/x` pointe vers `solutions/x` quand ce fichier existe, et vers `src/x` sinon.
  - Plugin Vite : `build/plugins.ts`.
  - `tsc` : `paths` dans `solutions/tsconfig.json`.
- Commandes utiles :
  - `npm run dev:solution` : l'app terminée, sur le port 5174.
  - `npm run verify:solution` : typecheck, puis tous les tests (91 verts), puis Playwright (15 verts).
  - Pour montrer la solution d'une étape : `diff src/chat/chat-types.ts solutions/chat/chat-types.ts`.

**Couverture de la demande de PXO :**

| Demandé | Où |
| --- | --- |
| Génériques, cas d'usage variés | A3 (fonction typée par un schéma, 2 paramètres de type dérivés), C5 (clé → handler affiné), M2 (mixin contraint), M4, B1 (`K extends KeysMatching<T, string>`), B3 (F-bounded `T extends { replies: T[] }`) |
| infer / conditional / distributive | C2 (`infer`, distribution), C3 (la distribution comme bug, `[E]`), M4 (`ArgsOf`), B1 |
| Zod v4 | A1 (`refine`, `stringbool`, `enum`, `pipe`, entrée vs sortie), A2 (`z.file`), C7 (`discriminatedUnion`, `templateLiteral`, `prettifyError`), B3 (getter récursif) |
| Exclude / Extract / NonNullable / ReturnType / Parameters / Awaited / never | C4, B2 / C1, A3 / A4 / A4 / A4, M4 / A4 / C2, C6, B2 |
| Templating (déjà codé) | tag `html` (Module B) dans toutes les pages, M1 ; template literal types (`usr_${string}`, `${string}.avif`) |
| Unions discriminées (déjà codées) | `ChatEvent`, `Offer`, `FormResult` |
| Mixins + décorateurs (déjà codés) | `Playable` / `Seekable` / `Audible`, `@logged` ; M2 et M3 à écrire |

**Ce qui va sortir en séance :**

- **Décorateurs standards et Vite 8.** Vite 8 compile le TypeScript avec Oxc, qui ne sait transformer que les décorateurs legacy.
  - `build/plugins.ts` (`standardDecorators`) passe `ts.transpileModule` sur les fichiers qui contiennent un décorateur.
  - Bonne occasion de répondre à « qui compile quoi ? ».
- **`z.email().trim()`** valide avant de trimer. Normaliser d'abord : `z.string().trim().toLowerCase().pipe(z.email())`.
- **`Intl.NumberFormat('fr-FR')`** met une espace fine insécable (U+202F) avant `€`. Le test de B2 normalise les espaces.
- **`preload="none"`** : `duration` vaut `NaN` tant que les métadonnées ne sont pas chargées. `Seekable.seek` se replie sur 0 ; affecter `currentTime = NaN` lève une erreur.
- **Le Chromium de Playwright et le H.264.** Vérifié avec Playwright 1.63 : son Chromium lit l'aperçu MP4 (H.264). Les anciennes versions de Playwright, basées sur le Chromium open source, ne le lisaient pas. Le `<video>` propose de toute façon une source WebM en repli.
