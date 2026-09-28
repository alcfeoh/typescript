# PXO — demi-journée pratique (fil rouge)

Une petite application TypeScript, sans framework, construite avec Vite. Elle a cinq pages : connexion, inscription avec upload d'avatar, chat de support, vidéos et offres premium. Toute la demi-journée se passe dedans. **Il n'y a pas de slides.** Chaque étape est une modification de l'app, guidée par des tests qui passent du rouge au vert.

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
| `npm run ex A1` | **les tests d'un seul exercice** (ici A1), en mode watch : ils se relancent à chaque sauvegarde |
| `npm run ex:once A1` | la même chose, une seule fois |
| `npm test` | tous les tests, une fois |
| `npm run typecheck` | `tsc` sur tout le projet (app + tests) |
| `npm run e2e` / `npm run e2e:ui` | Playwright (il démarre le serveur de dev tout seul) |

## L'application en deux minutes

- **Pas de framework :** chaque page est une fonction `mountXxx(root)` qui écrit son HTML avec le tag `html` (`src/shared/html.ts`) et branche ses écouteurs d'événements. Le routeur est dans `src/main.ts` (`#/login`, `#/signup`, `#/chat`, `#/media`, `#/premium`).
- **Pas de vrai serveur :** le serveur de dev Vite répond lui-même aux requêtes `POST /api/login`, `/api/signup` et `/api/avatar`. Ce faux back-end est écrit dans `build/plugins.ts` (`fakeBackend`). Le chat n'utilise pas de vrai WebSocket : `src/chat/fake-server.ts` simule un serveur qui pousse des messages.
- **Un dossier par fonctionnalité :** `src/account/`, `src/chat/`, `src/media/`, `src/premium/`, `src/comments/`. Ce qui est partagé est dans `src/shared/`.

## Comment fonctionnent les exercices

- **Chaque exercice est marqué `TODO <étape>`** dans `src/`. `grep -rn "TODO C3" src` le retrouve.
- **Les types à écrire valent `any` au départ.** Tout compile, mais rien n'est vérifié. Votre travail : les remplacer.
- **Les fonctions à écrire appellent `todo('C5')`.** Cela lève une erreur, et la page affiche `⚠️ Exercise C5 is not done yet`.
- **Deux sortes de tests :**
  - les fichiers `*.spec.ts` sont exécutés ;
  - les fichiers `*.test-d.ts` sont des tests de types. Ils ne sont jamais exécutés : Vitest les passe à `tsc` et transforme chaque erreur de type en test échoué. Par exemple, `Expected: literal number 1, Actual: any` veut dire que votre type vaut encore `any`.
- **Un exercice = ses propres fichiers de tests**, nommés d'après lui : `tests/1-account/A1-signup-schema.spec.ts`, `tests/2-chat/C3-batch.test-d.ts`… `npm run ex A1` ne lance que ceux-là. Pour T2 et M5 (Playwright), `npm run ex T2` lance le test une fois ; `npm run e2e:ui` ouvre l'interface graphique de Playwright.
- **Point de départ :** 79 en échec · 8 qui passent · 4 à écrire. Tout vert veut dire que le cas est terminé.
- **Les imports passent par `@/` :** `@/chat/chat-bus` désigne `src/chat/chat-bus.ts`.

---

## Partie 0 — Tests (30 min)

### T1 — Échauffement Vitest : `tests/0-tests/typing-indicator.spec.ts`

**Notions :** Vitest, fonctions espionnes (`vi.fn`), fausses horloges (`vi.useFakeTimers`), `ReturnType`  
**Lancer les tests :** `npm run ex T1`

**Contexte :** dans le chat, l'autre personne voit « Léa est en train d'écrire… ». Envoyer un événement à chaque touche frappée inonderait le serveur. `src/chat/typing-indicator.ts` n'envoie donc « j'écris » qu'à la première frappe, puis « j'ai arrêté » après 2 s sans frappe. Ce module dépend du temps : attendre 2 vraies secondes rendrait les tests lents et fragiles.

**Consigne :** le premier test est écrit. Transformez les quatre `it.todo` en vrais tests, avec de fausses horloges.

**Outils :** `vi.fn()`, `vi.useFakeTimers()`, `vi.advanceTimersByTime(ms)`, `toHaveBeenCalledTimes`, `toHaveBeenLastCalledWith`.

Remarque sur le code testé : `ReturnType<typeof setTimeout>` est le bon type pour l'identifiant d'un timer, à la fois dans Node et dans le navigateur.

### T2 — Playwright : `tests/e2e/T2-login.e2e.ts`

**Notions :** Playwright, locators accessibles (`getByRole`, `getByLabel`), assertions web-first, mock réseau (`page.route`), promesses  
**Lancer les tests :** `npm run ex T2`

**Contexte :** la page `#/login` (`src/account/login-page.ts`) valide le formulaire avec Zod dans le navigateur, puis appelle `POST /api/login` sur le faux back-end. Les tests unitaires ne voient pas ce parcours complet. Playwright pilote un vrai Chromium sur l'app servie par Vite, comme le ferait un utilisateur : taper, cliquer, lire l'écran.

**Démo du formateur :** les deux premiers tests.

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

**Le parcours :** l'utilisateur remplit le formulaire d'inscription. La page le valide, l'envoie au back-end, puis affiche un message de bienvenue et un second formulaire pour envoyer un avatar. La page est déjà écrite ; il lui manque les schémas de validation (A1, A2), la fonction qui les applique (A3) et les types des réponses du back-end (A4). Tant que A3 n'est pas fait, le bouton « Create account » affiche `⚠️ Exercise A3 is not done yet`.

### A1 — `SignupSchema` : `src/account/account-schema.ts`

**Notions :** Zod v4 (`z.object`, `.refine` inter-champs, `z.enum`, `z.stringbool`, `z.literal` + `.transform`, `.pipe`), `z.input` vs `z.output`, `as const`  
**Lancer les tests :** `npm run ex A1`

**Contexte :** la page lit le formulaire avec `FormData` : toutes les valeurs arrivent sous forme de chaînes, et une case non cochée n'arrive pas du tout. `SignupSchema` fait le pont entre ces données brutes et les données propres qu'on envoie à l'API. Il vérifie chaque champ et convertit ce qui doit l'être.

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

**Notions :** Zod v4 (`z.file()` avec `.max` et `.mime`, `.optional()`)  
**Lancer les tests :** `npm run ex A2`

**Contexte :** après l'inscription, un second formulaire permet d'envoyer une photo (`POST /api/avatar`). L'attribut `accept="image/*"` du champ fichier n'est qu'une suggestion au navigateur : l'utilisateur peut choisir n'importe quel fichier. On vérifie donc taille et type **avant** l'envoi, pour éviter un upload de 50 Mo refusé à l'arrivée.

1. `z.file()` de 2 Mo maximum (`2 MB maximum`).
2. PNG / JPEG / WebP / AVIF uniquement (`PNG, JPEG, WebP or AVIF only`).
3. Une `caption` optionnelle de 140 caractères maximum.

### A3 — `validateForm`, un seul générique pour tous les formulaires : `src/shared/form.ts`

**Notions :** génériques (paramètre contraint `S extends z.ZodType`, types dérivés du paramètre, 2 paramètres de type), `Record`, `Partial`, `Extract`, `keyof`, union discriminée  
**Lancer les tests :** `npm run ex A3`

**Contexte :** les deux formulaires de la page font la même chose : passer les données brutes dans un schéma, puis soit récupérer les données propres, soit afficher un message d'erreur sous chaque champ (`showFieldErrors`). Ouvrez `src/account/login-page.ts` : il fait ce travail à la main, en une dizaine de lignes. `validateForm` le fait une fois pour toutes, pour n'importe quel schéma — à condition que son type de retour suive le schéma qu'on lui passe.

1. `FieldErrors<T>` : une chaîne optionnelle par champ.
   - `Record`, `Partial`, et `Extract<keyof T, string>` : pourquoi `string` ?
2. `FormResult<In, Out>` : une union discriminée sur `ok`.
3. Rendez `validateForm` générique sur le **type du schéma** `S extends z.ZodType`, pour pouvoir en dériver les deux types : `FormResult<z.input<S>, z.output<S>>`. Gardez le premier message de chaque champ.

**Ce que ça apporte :** `result.data.country` est un `CountryCode` dans `signup-page.ts`, et la même fonction type le formulaire d'avatar.

### A4 — Des types dérivés d'un client d'API qu'on ne peut pas modifier : `src/account/account-types.ts`

**Notions :** `ReturnType`, `Awaited`, `NonNullable`, `Parameters`, accès indexé (`T['user']`), `typeof` sur une fonction, `import type`  
**Lancer les tests :** `npm run ex A4`

**Contexte :** `src/account/account-api.ts` regroupe les trois fonctions par lesquelles les pages parlent au back-end : `login`, `signup` et `uploadAvatar`. Chacune fait un `fetch` vers `/api/…` (servi par le faux back-end de `build/plugins.ts`) et renvoie la réponse. Par exemple, `signup` renvoie `{ user, token }`, ou `null` si l'e-mail est déjà pris. Dans un vrai projet, ce fichier serait **généré** à partir de la spécification OpenAPI du back-end (avec openapi-typescript, Orval…) : on ne le modifie pas, et il n'exporte aucun type nommé pour ses réponses — ils n'existent qu'en ligne, dans les signatures.

Or les pages ont besoin de ces types : `welcome.ts` affiche la session reçue après l'inscription, et `signup-page.ts` passe des options à `uploadAvatar`. Les recopier à la main, c'est prendre le risque qu'ils divergent le jour où l'API change. On les **dérive** donc des signatures des fonctions :

- `SignupResponse = Awaited<ReturnType<typeof signup>>`
- `Session = NonNullable<…>`
- `User = Session['user']`
- `UploadOptions` : le second paramètre de `uploadAvatar`, sans `undefined`. Utilisez `Parameters` et `NonNullable`.

**Ce que ça apporte :** lancez `npm run typecheck`. Un bug que `any` cachait apparaît dans `src/account/welcome.ts`. Inscrivez-vous dans l'app avant et après la correction.

---

## Cas 2 — Chat (55 min)

**Page :** `#/chat`.
**Tests :** `tests/2-chat/`. La page prend vie après C5 et C7.

**Le parcours :** un chat de support avec « Léa ». Dans une vraie app, le serveur pousserait des événements par WebSocket : un nouveau message, « Léa écrit… », « message lu », une réaction emoji, une notification système. Ici, `src/chat/fake-server.ts` joue ce rôle. Il envoie des **frames** : des chaînes JSON contenant chacune un lot d'événements, dont deux sont volontairement cassées.

**Déjà codé :**

- `chat-events.ts` : l'union discriminée `ChatEvent`, c'est-à-dire le contrat de tout ce que le serveur peut envoyer. Les identifiants sont des template literal types (`usr_${string}`).
- `fake-server.ts` : le faux serveur.
- `chat-page.ts` : la page. Pour chaque frame reçue, elle la décode (C7), met à jour l'état avec le reducer (C6), prévient les abonnés par le bus (C5), puis réaffiche.

### C1 — `ChatEventType`, `EventOf<K>` : `src/chat/chat-types.ts`

**Notions :** accès indexé sur une union, `Extract`, générique contraint (`K extends ChatEventType`)  
**Lancer les tests :** `npm run ex C1`

**Contexte :** tout le reste du chat a besoin de parler des événements par leur type : « les handlers de `typing` », « l'événement `read` ». Plutôt que de réécrire ces types à la main, on les dérive de `ChatEvent`. Ajoutez un événement au contrat, et tout ce qui en dépend suit.

- `ChatEventType` : accès indexé `ChatEvent['type']`.
- `EventOf<K>` : `Extract` du membre dont le `type` vaut `K`.

### C2 — `PayloadOf<E>` et `EventWithoutPayload`

**Notions :** types conditionnels, `infer`, distributivité, `never`  
**Lancer les tests :** `npm run ex C2`

**Contexte :** l'état du chat stocke des messages, pas des événements : il a besoin du contenu (`payload`) d'un événement `message`. `src/chat/chat-reducer.ts` définit `Message = PayloadOf<EventOf<'message'>>`. Certains événements (`ping`) n'ont pas de contenu.

- `PayloadOf<E>` : un type conditionnel avec `infer`. Il doit valoir `never` quand il n'y a pas de payload, et **se distribuer** sur une union.
- `EventWithoutPayload` : la distributivité utilisée exprès, puisque `never` disparaît d'une union. Comment le `Exclude` natif est-il écrit ?

### C3 — Le bug de `Batch<E>`

**Notions :** types conditionnels, distributivité et comment la désactiver (`[E] extends […]`)  
**Lancer les tests :** `npm run ex C3`

**Contexte :** le serveur regroupe plusieurs événements dans une même frame, par exemple « Léa a arrêté d'écrire » + « nouveau message de Léa ». Un lot **mélange** donc les types d'événements. `Batch<ChatEvent>` est le type de retour du décodeur (C7).

Il compile, mais le test-d échoue avec `not assignable to parameter of type 'never'` quand on ajoute un `typing` après un `message`.

- Pourquoi `Batch<ChatEvent>` donne-t-il `MessageEvent[] | TypingEvent[] | …` ?
- Coupez la distribution avec `[E] extends [ChatEvent]`.

### C4 — `OutgoingEvent`

**Notions :** `Exclude`  
**Lancer les tests :** `npm run ex C4`

**Contexte :** le client envoie lui aussi des événements : ses messages, « j'écris », « lu », ses réactions. En revanche, `system` et `ping` ne viennent que du serveur. `OutgoingEvent` est le type du paramètre de `FakeChatServer.send()` : le compilateur empêche alors la page d'envoyer un événement réservé au serveur.

Tout sauf `system` et `ping`. Utilisez `Exclude`.

### C5 — Bus générique : `src/chat/chat-bus.ts`

**Notions :** génériques (méthode générique, inférence depuis un littéral), narrowing, contravariance des paramètres, champs `#privés`  
**Lancer les tests :** `npm run ex C5`

**Contexte :** certaines parties de la page doivent réagir à un type d'événement précis. Par exemple, quand un message de Léa arrive, la page renvoie un accusé de lecture ; une notification système de niveau `warning` part dans la console. Le bus distribue chaque événement aux fonctions abonnées à son type. Ouvrez `chat-page.ts` et cherchez `bus.on(` : aujourd'hui, `event` y vaut `any`.

`on<K extends ChatEventType>(type: K, handler: (event: EventOf<K>) => void)`, plus `emit`.

- K est inféré depuis `'typing'`, et le handler reçoit l'événement déjà affiné (narrowed).
- Il reste un cast inévitable dans `emit` : où, et pourquoi est-il sûr ?

### C6 — Reducer : `src/chat/chat-reducer.ts`

**Notions :** unions discriminées, narrowing par `switch`, exhaustivité avec `never`, immutabilité (spread), `Partial<Record<…>>`  
**Lancer les tests :** `npm run ex C6`

**Contexte :** l'état affiché (messages, qui écrit, qui a lu, réactions, notifications) est recalculé à chaque événement par une fonction pure `(état, événement) → nouvel état`, puis la page réaffiche tout. Aujourd'hui, seul `message` est géré : pas d'indicateur « écrit… », pas de ✓✓, pas de réactions.

Gérez `typing` (sans doublons), `read` (une fois par lecteur), `reaction` (compte par emoji), `system` et `ping`, sans muter l'état. Remplacez ensuite `default: return state` par `return assertNever(event)`.

**À essayer :**

1. Ajoutez un événement `{ type: 'delete'; payload: { messageId: MessageId } }` à `ChatEvent`, puis lancez `npm run typecheck`. Le compilateur liste tous les endroits à mettre à jour : le reducer (`never`) et le schéma Zod (C7).
2. Annulez la modification.

### C7 — Valider à la frontière : `src/chat/chat-wire.ts`

**Notions :** Zod v4 (`z.discriminatedUnion`, `z.templateLiteral`, `z.enum`, `safeParse`, `z.prettifyError`), `unknown`, template literal types, validation à l'exécution  
**Lancer les tests :** `npm run ex C7`

**Contexte :** tout ce qui précède repose sur l'idée que le serveur respecte `ChatEvent`. Mais les frames arrivent sous forme de texte, et `JSON.parse` renvoie `any` : rien ne garantit qu'un serveur d'une autre version, ou buggé, envoie ce qu'on attend. Les types TypeScript n'existent plus à l'exécution. C'est donc ici, à l'entrée, qu'on vérifie vraiment les données.

- `ChatEventSchema = z.discriminatedUnion('type', [...])`. Les identifiants utilisent `z.templateLiteral(['usr_', z.string()])`, les emojis `z.enum(EMOJIS)`.
- Le test-d vérifie que `z.output<typeof ChatEventSchema>` est **exactement** `ChatEvent` : le schéma Zod et le type TypeScript ne peuvent pas diverger.
- `parseWireFrame(raw)` ne lève jamais d'erreur :
  - JSON invalide ou pas un tableau → `[]`
  - un événement invalide → ignoré, avec un `console.warn`

**Ce que ça apporte :** ouvrez la console du navigateur sur `#/chat`. Les deux frames cassées du serveur sont écartées, et le chat continue de fonctionner.

---

## Cas 3 — Vidéos (40 min)

**Page :** `#/media`.
**Tests :** `tests/3-media/`. Ils tournent dans `happy-dom`, un DOM implémenté en Node.

**Le parcours :** une grille de vidéos. Chaque carte montre une affiche ; au survol, un court extrait muet se lance à la place. Un clic ouvre le lecteur, avec ses boutons (lecture, ±5 s, volume) et ses raccourcis clavier, puis les commentaires de la vidéo.

**Déjà codé :**

- le tag `html` (Module B) ;
- les mixins `Playable`, `Seekable`, `Audible` (Module D) ;
- le décorateur `@logged` ;
- `media-page.ts`, qui construit la grille, le lecteur et les commentaires.

### M1 — `mediaCard()` : `src/media/media-card.ts`

**Notions :** templating (tag `html`, `SafeHtml`), template literal types (`${string}.avif`), `<picture>` / `<source>`  
**Lancer les tests :** `npm run ex M1`

**Contexte :** `media-page.ts` appelle `mediaCard(media)` pour chaque vidéo du catalogue (`CATALOG`, dans `media-types.ts`) et insère le HTML obtenu. PXO veut l'affiche en AVIF, plus léger, quand le navigateur le supporte, et en JPEG sinon. La balise `<picture>` règle ce choix sans aucun JavaScript.

Le HTML attendu est écrit dans le commentaire :

- `<picture>` avec une `<source>` AVIF et un `<img>` JPEG en repli ;
- `<video class="preview" muted loop playsinline preload="none">` avec une source MP4, puis WebM si le média en a une ;
- le titre et la durée.

Attention : `alt=${title}` sans guillemets s'arrête au premier espace.

**Où sont les types ?** Dans `media-types.ts` : `AvifUrl = `${string}.avif``. Essayez d'inverser `avif` et `jpeg` dans `CATALOG`.

### M2 — Le mixin `Previewable` : `src/media/player.ts`

**Notions :** mixins, génériques contraints (`Constructor<T>` + intersection), champs `#privés`, décorateur `@logged` (déjà codé)  
**Lancer les tests :** `npm run ex M2`

**Contexte :** l'extrait au survol et le grand lecteur utilisent la même classe, `VideoPlayer`. Elle est construite en empilant des mixins, chacun apportant une capacité : `Playable` (lecture/pause), `Seekable` (se déplacer dans la vidéo), `Audible` (volume). `Previewable` ajoute l'aperçu au survol, en se servant des méthodes des autres mixins. `media-page.ts` appelle `startPreview()` quand la souris entre sur la carte, et `stopPreview()` quand elle sort.

1. **Contrainte :** ce mixin appelle `play()`, `pause()` et `seek()`. Contraignez `TBase` (`Constructor<BasePlayer & …>`) pour que `Previewable(BasePlayer)` ne compile pas.
2. **`startPreview()` :** couper le son, `seek(10 % de la durée)`, `play()`.
3. **`stopPreview()` :** pause, `seek(0)`, remettre le son comme avant.
   - Utilisez un champ `#privé` dans le mixin.

**Ce que ça apporte :** survoler une carte lance son aperçu. Les lignes `@logged` dans la console (niveau Verbose) montrent que `seek` et `play` passent bien par les mixins.

### M3 — Le décorateur de setter `@clamp(min, max)` : `src/shared/clamp.ts`

**Notions :** décorateurs standards (setter, `ClassSetterDecoratorContext`), fabrique de décorateur, générique `This`  
**Lancer les tests :** `npm run ex M3`

**Contexte :** les boutons 🔉 / 🔊 et les flèches ↑ ↓ appellent `changeVolume(±0.1)`. Le navigateur n'accepte qu'un volume entre 0 et 1 : au-delà, il lève une erreur. Plutôt que de vérifier la valeur à chaque appel, on la borne une seule fois, sur le setter `volume` du mixin `Audible`, avec un décorateur.

Décorateurs standards, sans `experimentalDecorators`.

- **Avant :** cliquez sur 🔊 à 100 %. `HTMLMediaElement.volume = 1.1` lève une `IndexSizeError` (regardez la console).
- **Après :** le volume reste dans `[0, 1]`.

### M4 (s'il reste du temps) — Raccourcis clavier typés à partir de la classe : `src/media/player-remote.ts`

**Notions :** mapped types, types conditionnels, `infer`, `keyof`, tuples variadiques (`[C, ...Args]`), `satisfies`, `Parameters`  
**Lancer les tests :** `npm run ex M4`

**Contexte :** `SHORTCUTS` associe une touche à une commande du lecteur et à ses arguments : `ArrowRight → ['skip', 5]`. Aujourd'hui, c'est typé `any` : une faute de frappe (`'skp'`) ou un argument du mauvais type ne se voient qu'au moment où l'on appuie sur la touche. On veut que la liste des commandes et de leurs arguments soit **dérivée** de la classe `VideoPlayer`.

- `MethodKeys<T>` : un mapped type + un conditionnel + `[keyof T]`. Les getters comme `volume` sont éliminés.
- `ArgsOf<T, K>` : avec `infer`, car `Parameters<T[K]>` ne compile pas ici. Pourquoi ?
- `Shortcut` : `['skip', 5]` ✅, `['skip', '5']` ❌, `['seek']` ❌.

### M5 (optionnel) — Playwright : `tests/e2e/M5-media.e2e.ts`

**Notions :** Playwright (`hover`, `locator.evaluate`, `expect.poll`)  
**Lancer les tests :** `npm run ex M5`

**Contexte :** les tests de M1 vérifient le HTML produit, mais `happy-dom` ne décode ni images ni vidéos. Seul un vrai navigateur peut confirmer qu'il a choisi l'AVIF et que l'extrait joue.

- c'est bien le poster AVIF qui est choisi (`img.currentSrc`) ;
- le survol lance l'aperçu sans le son, et le quitter le met en pause et le rembobine.

---

## Bonus

- **B1 — `src/shared/search.ts` :** le formulaire d'inscription a un champ « Search a country » qui filtre la liste des pays. Il appelle `searchBy(COUNTRIES, 'name', saisie)`. Écrivez `KeysMatching<T, V>` et rendez `searchBy(items, key, query)` générique : `key` doit être une propriété de type chaîne. Tant que ce n'est pas fait, la liste n'est pas filtrée.
  - **Notions :** génériques à 2 paramètres (`K extends KeysMatching<T, string>`), mapped types, types conditionnels, `never`
  - **Lancer les tests :** `npm run ex B1`
- **B2 — `src/premium/offers.ts` :** la page `#/premium` affiche les formules (gratuite, mensuelle, annuelle, à vie) et le coût mensuel de celle qu'on choisit.
  - `PaidOffer` avec `Exclude` ;
  - `monthlyCost` et `priceLabel`, tous deux exhaustifs (`never`).
  - **Notions :** `Exclude`, unions discriminées, exhaustivité avec `never`, `as const satisfies`
  - **Lancer les tests :** `npm run ex B2`
- **B3 — `src/comments/comments.ts` :** les commentaires, affichés sous le lecteur, sont en fil de discussion : chaque commentaire peut avoir des réponses, qui ont elles-mêmes des réponses.
  - un schéma Zod récursif, avec un getter ;
  - `countNodes` / `flattenTree` génériques sur n'importe quel arbre : `T extends { replies: readonly T[] }` ;
  - le fil de la deuxième vidéo contient une réponse invalide, et la page le signale.
  - **Notions :** types récursifs, schéma Zod récursif (getter), génériques F-bounded, `z.templateLiteral`
  - **Lancer les tests :** `npm run ex B3`

---

Formateur : voir [`formateur-README.md`](formateur-README.md) (déroulé minuté, réponses, pièges, mode solution).
