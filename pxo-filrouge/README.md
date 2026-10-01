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

**Ce que vous allez faire :** écrire quatre tests qui vérifient ce comportement, sans jamais attendre réellement.

**Étapes :**

1. **Lisez le premier test**, déjà écrit. Il crée une fonction espionne avec `vi.fn()` : une fausse fonction qui enregistre chacun de ses appels. On la passe à `createTypingIndicator` à la place du vrai callback, puis on vérifie avec `toHaveBeenCalledWith(true)` qu'elle a été appelée avec `true`.
2. **Remarquez le `vi.useFakeTimers()`** dans `beforeEach`. À partir de là, `setTimeout` ne s'exécute plus tout seul : c'est le test qui fait avancer le temps, avec `vi.advanceTimersByTime(ms)`. Deux secondes passent ainsi en une microseconde.
3. **Remplacez chaque `it.todo('…')` par un vrai `it('…', () => { … })`**, en gardant le même titre. Pour chacun :
   - créez l'espion et l'indicateur, comme dans le premier test ;
   - simulez des frappes avec `indicator.keystroke()` et faites avancer le temps ;
   - vérifiez le nombre d'appels (`toHaveBeenCalledTimes`) et la valeur du dernier appel (`toHaveBeenLastCalledWith`).
4. **Pour « pas une milliseconde avant »**, avancez de 1999 ms et vérifiez que rien n'a changé, puis de 1 ms et vérifiez que `false` est arrivé.

**Vérifier :** `npm run ex T1` affiche 5 tests verts.

Remarque sur le code testé : `ReturnType<typeof setTimeout>` est le bon type pour l'identifiant d'un timer, à la fois dans Node et dans le navigateur.

### T2 — Playwright : `tests/e2e/T2-login.e2e.ts`

**Notions :** Playwright, locators accessibles (`getByRole`, `getByLabel`), assertions web-first, mock réseau (`page.route`), promesses  
**Lancer les tests :** `npm run ex T2`

**Contexte :** la page `#/login` (`src/account/login-page.ts`) valide le formulaire avec Zod dans le navigateur, puis appelle `POST /api/login` sur le faux back-end. Les tests unitaires ne voient pas ce parcours complet. Playwright pilote un vrai Chromium sur l'app servie par Vite, comme le ferait un utilisateur : taper, cliquer, lire l'écran.

**Démo du formateur :** les deux premiers tests. Retenez-en trois outils :

- **Les locators** trouvent un élément comme le ferait un utilisateur : `page.getByLabel('Email')` trouve le champ dont le libellé est « Email », `page.getByRole('button', { name: 'Log in' })` le bouton « Log in ».
- **Les assertions « web-first »** comme `await expect(locator).toHaveText('…')` réessaient pendant 5 s jusqu'à ce que la condition soit vraie. Pas besoin d'attendre à la main que la réponse du serveur arrive.
- **`page.route('**/api/login', handler)`** intercepte les requêtes du navigateur vers cette URL. Le handler peut répondre à la place du serveur (`route.fulfill(…)`) ou laisser passer la requête (`route.continue()`).

**Ce que vous allez faire :** transformer les trois `test.fixme` en vrais tests. `test.fixme` marque un test comme « à écrire » : Playwright l'ignore. Remplacez `test.fixme` par `test` et écrivez le corps.

**Étapes :**

1. **T2.a — Un e-mail invalide n'envoie rien au serveur.**
   - Avant de remplir le formulaire, posez un `page.route('**/api/login', …)` dont le handler incrémente un compteur, puis appelle `route.continue()`.
   - Remplissez l'e-mail avec `not-an-email`, un mot de passe quelconque, et cliquez sur « Log in ».
   - Vérifiez que le message `Invalid email` est visible (`getByText('Invalid email', { exact: true })` : sans `exact`, il trouverait aussi « Invalid email or password »).
   - Vérifiez que le compteur vaut toujours 0.
2. **T2.b — Un mauvais mot de passe affiche une erreur.** Le faux back-end répond 401 à tout sauf aux identifiants de démo. Connectez-vous avec `demo@pxo.fr` et un mauvais mot de passe, puis vérifiez que `page.getByRole('alert')` affiche `Invalid email or password`.
3. **T2.c — Le bouton est désactivé pendant la requête.** Il faut « geler » le serveur le temps de regarder le bouton :
   - créez une promesse que vous résoudrez vous-même : `let release!: () => void; const released = new Promise<void>((r) => (release = r));`
   - dans `page.route`, attendez-la (`await released`) avant d'appeler `route.continue()` ;
   - cliquez sur « Log in », vérifiez `toBeDisabled()`, appelez `release()`, puis vérifiez `toBeEnabled()`.

**Vérifier :** `npm run ex T2` affiche 5 tests verts.

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

**Ce que vous allez faire :** compléter le schéma. `email`, `displayName` et `password` sont déjà écrits : inspirez-vous-en. Les messages d'erreur exacts attendus sont dans `tests/1-account/A1-signup-schema.spec.ts`.

**Étapes :**

1. **Ajoutez le champ `confirmPassword`**, une simple chaîne (`z.string()`).
2. **Vérifiez que les deux mots de passe sont identiques.** Cette règle porte sur deux champs à la fois : elle ne peut pas s'écrire sur un champ seul. Ajoutez un `.refine(…)` **après** le `z.object({ … })` : il reçoit l'objet entier et renvoie `true` si tout va bien.
   - Deuxième argument : `{ error: 'Passwords do not match', path: ['confirmPassword'] }`. `path` indique sous quel champ afficher l'erreur ; sans lui, elle serait rattachée au formulaire entier et n'apparaîtrait sous aucun champ.
3. **Ajoutez `country`**, qui doit être l'un des codes de la liste des pays. `z.enum(COUNTRY_CODES, { error: 'Please pick a country' })` accepte uniquement ces valeurs.
   - `COUNTRY_CODES` est déjà importé. Il est construit à partir de `COUNTRIES` (`src/shared/countries.ts`), déclaré avec `as const` : TypeScript garde les valeurs exactes (`'FR'`, `'BE'`…) au lieu de `string`. Résultat : le type du champ sera `'FR' | 'BE' | …`, et ajouter un pays dans la liste mettra le type à jour tout seul.
4. **Ajoutez `newsletter`**, une case à cocher facultative. Cochée, elle envoie la chaîne `"on"` ; décochée, elle n'envoie rien. On veut un vrai booléen. `z.stringbool()` convertit `"on"`, `"true"`, `"1"`… en `true` ; ajoutez `.default(false)` pour le cas où le champ est absent.
5. **Ajoutez `acceptTerms`**, une case obligatoire. Elle doit valoir `"on"` (`z.literal('on', { error: 'You must accept the terms' })`), et l'API attend `true`. Ajoutez `.transform(() => true as const)` pour la convertir.
   - Sans `as const`, TypeScript élargit `true` en `boolean`, et le test de type échoue : on veut que le type de sortie dise « toujours `true` ».
6. **Normalisez l'e-mail :** `'  Alice@PXO.fr '` doit devenir `'alice@pxo.fr'`.
   - ⚠️ Piège : `z.email().trim()` vérifie le format **avant** de supprimer les espaces, donc rejette `'  Alice@PXO.fr '`.
   - Il faut d'abord nettoyer une chaîne, puis la passer au validateur d'e-mail : `z.string().trim().toLowerCase().pipe(z.email(…))`. `.pipe()` enchaîne deux schémas : la sortie du premier devient l'entrée du second.

**Vérifier :** `npm run ex A1` passe au vert. Le test de type vérifie aussi qu'en **entrée**, `newsletter` est une `string | undefined` et qu'en **sortie** c'est un `boolean` : un même schéma décrit deux types, `z.input<…>` (ce que le formulaire envoie) et `z.output<…>` (ce que l'API reçoit).

### A2 — `AvatarSchema` et `UploadSchema`

**Notions :** Zod v4 (`z.file()` avec `.max` et `.mime`, `.optional()`)  
**Lancer les tests :** `npm run ex A2`

**Contexte :** après l'inscription, un second formulaire permet d'envoyer une photo (`POST /api/avatar`). L'attribut `accept="image/*"` du champ fichier n'est qu'une suggestion au navigateur : l'utilisateur peut choisir n'importe quel fichier. On vérifie donc taille et type **avant** l'envoi, pour éviter un upload de 50 Mo refusé à l'arrivée.

**Ce que vous allez faire :** compléter les deux schémas, toujours dans `src/account/account-schema.ts`.

**Étapes :**

1. **Limitez la taille de l'avatar à 2 Mo.** `z.file()` valide un objet `File` du navigateur. Ajoutez `.max(2 * 1024 * 1024, { error: '2 MB maximum' })` : la taille se compte en **octets**.
2. **N'acceptez que quatre formats d'image.** Ajoutez `.mime([...], { error: 'PNG, JPEG, WebP or AVIF only' })` avec les types MIME `image/png`, `image/jpeg`, `image/webp` et `image/avif`. Le type MIME est le format déclaré du fichier (`file.type`).
3. **Ajoutez une légende facultative à `UploadSchema` :** un champ `caption`, chaîne de 140 caractères au plus (`.max(140)`), rendu facultatif avec `.optional()`.

**Vérifier :** `npm run ex A2` passe au vert.

### A3 — `validateForm`, un seul générique pour tous les formulaires : `src/shared/form.ts`

**Notions :** génériques (paramètre contraint `S extends z.ZodType`, types dérivés du paramètre, 2 paramètres de type), `Record`, `Partial`, `Extract`, `keyof`, union discriminée  
**Lancer les tests :** `npm run ex A3`

**Contexte :** les deux formulaires de la page font la même chose : passer les données brutes dans un schéma, puis soit récupérer les données propres, soit afficher un message d'erreur sous chaque champ (`showFieldErrors`). Ouvrez `src/account/login-page.ts` : il fait ce travail à la main, en une dizaine de lignes. `validateForm` le fait une fois pour toutes, pour n'importe quel schéma — à condition que son type de retour suive le schéma qu'on lui passe.

**Ce que vous allez faire :** écrire deux types et une fonction générique dans `src/shared/form.ts`. Aujourd'hui, les trois valent `any` : `validateForm` accepte n'importe quel schéma, mais la page ne sait rien de ce qu'elle renvoie.

**Étapes :**

1. **Écrivez le type `FieldErrors<T>`**, qui décrit les erreurs d'un formulaire dont les champs sont décrits par `T`. Pour chaque champ, il y a au plus un message ; un champ sans erreur est simplement absent.
   - Résultat attendu : `FieldErrors<{ email: string; age: number }>` doit donner `{ email?: string; age?: string }`.
   - `Record<K, V>` construit un type objet dont les clés sont `K` et les valeurs `V`. `Partial<X>` rend toutes les propriétés de `X` facultatives.
   - Pour les clés, `keyof T` donne les noms des propriétés de `T`. Mais `keyof` peut aussi contenir des `number` et des `symbol`, alors que les noms de champs d'un formulaire sont des chaînes. `Extract<keyof T, string>` ne garde que les clés de type `string`.
2. **Écrivez le type `FormResult<In, Out>`**, le résultat d'une validation. Une validation réussit ou échoue, et on veut que TypeScript sache lequel des deux cas on manipule. On utilise une **union discriminée** : deux formes d'objet qui partagent une propriété dont la valeur les distingue, ici `ok`.
   - Résultat attendu : `{ ok: true; data: Out } | { ok: false; errors: FieldErrors<In> }`.
   - Pourquoi deux paramètres ? Les données validées ont le type de **sortie** du schéma (après conversion : `country` est un `CountryCode`, `newsletter` un `boolean`). Les erreurs, elles, portent sur les champs du formulaire tel qu'il a été saisi, donc sur le type d'**entrée**.
   - Une fois `FormResult` écrit, un `if (result.ok)` suffit : à l'intérieur, TypeScript sait que `result.data` existe ; dans le `else`, que `result.errors` existe.
3. **Rendez `validateForm` générique.** Ajoutez un paramètre de type `S` qui représente le type du schéma reçu : `validateForm<S extends z.ZodType>(schema: S, input: unknown)`.
   - `extends z.ZodType` est une **contrainte** : `S` doit être un schéma Zod. C'est ce qui vous autorise à appeler `schema.safeParse()`.
   - Vous n'aurez jamais à écrire `S` à l'appel : TypeScript le déduit de l'argument. Avec `validateForm(SignupSchema, …)`, `S` vaut `typeof SignupSchema`.
   - Déclarez le type de retour `FormResult<z.input<S>, z.output<S>>`. `z.input<S>` et `z.output<S>` extraient d'un schéma ses types d'entrée et de sortie. Un seul paramètre de type, deux types dérivés.
4. **Écrivez le corps de la fonction.**
   - `schema.safeParse(input)` ne lève jamais d'exception : il renvoie `{ success: true, data }` ou `{ success: false, error }`.
   - En cas de succès, renvoyez `{ ok: true, data }`.
   - En cas d'échec, `error.issues` liste tous les problèmes trouvés. Chaque problème a un `path` (le chemin du champ, par exemple `['email']`) et un `message`. Construisez l'objet `errors` en gardant **le premier message** de chaque champ (`path[0]`), puis renvoyez `{ ok: false, errors }`.
   - TypeScript vous demandera un cast au moment d'écrire `errors[field]` : Zod type les chemins en `PropertyKey[]`, il ne peut pas savoir que ce sont des champs du formulaire.

**Vérifier :**

- `npm run ex A3` passe au vert.
- Dans `src/account/signup-page.ts`, survolez `result.data.country` : son type est `'FR' | 'BE' | …`, et non plus `any`.
- Dans l'app, cliquez sur « Create account » avec un formulaire vide : les messages apparaissent sous chaque champ.
- Si A2 n'est pas fini, `npm run typecheck` signale `result.data.caption` dans `signup-page.ts`. C'est la preuve que le générique fonctionne : la page ne peut plus utiliser un champ que le schéma ne déclare pas.

### A4 — Des types dérivés d'un client d'API qu'on ne peut pas modifier : `src/account/account-types.ts`

**Notions :** `ReturnType`, `Awaited`, `NonNullable`, `Parameters`, accès indexé (`T['user']`), `typeof` sur une fonction, `import type`  
**Lancer les tests :** `npm run ex A4`

**Contexte :** `src/account/account-api.ts` regroupe les trois fonctions par lesquelles les pages parlent au back-end : `login`, `signup` et `uploadAvatar`. Chacune fait un `fetch` vers `/api/…` (servi par le faux back-end de `build/plugins.ts`) et renvoie la réponse. Par exemple, `signup` renvoie `{ user, token }`, ou `null` si l'e-mail est déjà pris. Dans un vrai projet, ce fichier serait **généré** à partir de la spécification OpenAPI du back-end (avec openapi-typescript, Orval…) : on ne le modifie pas, et il n'exporte aucun type nommé pour ses réponses — ils n'existent qu'en ligne, dans les signatures.

Or les pages ont besoin de ces types : `welcome.ts` affiche la session reçue après l'inscription, et `signup-page.ts` passe des options à `uploadAvatar`. Les recopier à la main, c'est prendre le risque qu'ils divergent le jour où l'API change. On les **dérive** donc des signatures des fonctions.

**Ce que vous allez faire :** remplacer les quatre `any` de `src/account/account-types.ts`, en partant uniquement des fonctions. Commencez par ouvrir `account-api.ts` et lisez la signature de `signup` : elle renvoie `Promise<{ user: …; token: string } | null>`.

**Étapes :**

1. **`SignupResponse` : ce que `signup()` renvoie une fois la promesse résolue.**
   - `typeof signup` donne le type de la fonction elle-même. (`signup` est importé avec `import type` : on ne s'en sert que pour son type, rien n'est importé à l'exécution.)
   - `ReturnType<F>` donne le type de retour d'une fonction : ici `Promise<{ … } | null>`.
   - `Awaited<P>` donne ce qu'une promesse contient une fois résolue.
   - Attendu : `{ user: …; token: string } | null`.
2. **`Session` : une réponse réussie, c'est-à-dire `SignupResponse` sans le `null`.** `NonNullable<X>` retire `null` et `undefined` d'un type.
3. **`User` : la partie `user` d'une session.** L'accès indexé `T['clé']` donne le type d'une propriété, comme `objet.clé` donne sa valeur.
4. **`UploadOptions` : le second paramètre de `uploadAvatar`.**
   - `Parameters<F>` donne les paramètres d'une fonction sous forme de tuple : `[file: File, options?: { … }]`. Prenez l'élément d'indice `1`.
   - Ce paramètre est facultatif, donc son type contient `undefined`. Retirez-le avec `NonNullable`.

**Vérifier :**

- `npm run ex A4` passe au vert.
- Lancez `npm run typecheck` : une erreur apparaît dans `src/account/welcome.ts`. Ce fichier affiche `session.user.name`, qui n'existe pas ; tant que `Session` valait `any`, TypeScript ne pouvait pas le voir. Inscrivez-vous dans l'app : le message dit « Welcome, ! ». Corrigez `welcome.ts` avec la bonne propriété, puis réessayez.

---

## Cas 2 — Chat (55 min)

**Page :** `#/chat`.
**Tests :** `tests/2-chat/`. La page prend vie après C5 et C7.

**Le parcours :** un chat de support avec « Léa ». Dans une vraie app, le serveur pousserait des événements par WebSocket : un nouveau message, « Léa écrit… », « message lu », une réaction emoji, une notification système. Ici, `src/chat/fake-server.ts` joue ce rôle. Il envoie des **frames** : des chaînes JSON contenant chacune un lot d'événements, dont deux sont volontairement cassées.

**Déjà codé :**

- `chat-events.ts` : l'union discriminée `ChatEvent`, c'est-à-dire le contrat de tout ce que le serveur peut envoyer. Chaque événement a un `type` (`'message'`, `'typing'`…) et, sauf `ping`, un `payload` (son contenu). Les identifiants sont des template literal types : `usr_${string}` veut dire « une chaîne qui commence par `usr_` ».
- `fake-server.ts` : le faux serveur.
- `chat-page.ts` : la page. Pour chaque frame reçue, elle la décode (C7), met à jour l'état avec le reducer (C6), prévient les abonnés par le bus (C5), puis réaffiche.

**Avant de commencer, ouvrez `src/chat/chat-events.ts`** et lisez `ChatEvent` : tous les exercices C1 à C7 en partent.

### C1 — `ChatEventType`, `EventOf<K>` : `src/chat/chat-types.ts`

**Notions :** accès indexé sur une union, `Extract`, générique contraint (`K extends ChatEventType`)  
**Lancer les tests :** `npm run ex C1`

**Contexte :** tout le reste du chat a besoin de parler des événements par leur type : « les handlers de `typing` », « l'événement `read` ». Plutôt que de réécrire ces types à la main, on les dérive de `ChatEvent`. Ajoutez un événement au contrat, et tout ce qui en dépend suit.

**Étapes :**

1. **Écrivez `ChatEventType`, la liste de tous les types d'événements** : `'message' | 'typing' | 'read' | 'reaction' | 'system' | 'ping'`. Ne la recopiez pas : sur une union d'objets, `ChatEvent['type']` donne l'union des valeurs de `type` de tous les membres.
2. **Écrivez `EventOf<K>`, qui retrouve l'événement complet à partir de son type.** Par exemple, `EventOf<'typing'>` doit donner `{ type: 'typing'; payload: { author: UserId; isTyping: boolean } }`.
   - `Extract<Union, Forme>` garde les membres de l'union qui correspondent à la forme donnée. Quelle forme ont les événements dont le `type` vaut `K` ?
   - `K extends ChatEventType` est déjà écrit : il interdit `EventOf<'tpying'>`.

**Vérifier :** `npm run ex C1` passe au vert.

### C2 — `PayloadOf<E>` et `EventWithoutPayload`

**Notions :** types conditionnels, `infer`, distributivité, `never`  
**Lancer les tests :** `npm run ex C2`

**Contexte :** l'état du chat stocke des messages, pas des événements : il a besoin du contenu (`payload`) d'un événement `message`. `src/chat/chat-reducer.ts` définit `Message = PayloadOf<EventOf<'message'>>`. Certains événements (`ping`) n'ont pas de contenu.

**Rappels :**

- Un **type conditionnel** s'écrit `A extends B ? Si : Sinon` : « si `A` est compatible avec `B`, alors `Si`, sinon `Sinon` ».
- **`infer`** s'utilise dans la partie `B` pour capturer un morceau du type : dans `E extends { payload: infer P } ? P : never`, TypeScript cherche une propriété `payload` dans `E` et nomme `P` son type.
- **Distributivité** : quand on passe une union à un type conditionnel dont le paramètre est « nu » (`E extends …`, sans rien autour), TypeScript l'applique à chaque membre séparément, puis réunit les résultats. Un résultat `never` disparaît de l'union.

**Étapes :**

1. **Écrivez `PayloadOf<E>`**, qui donne le `payload` d'un événement, ou `never` s'il n'en a pas.
   - `PayloadOf<EventOf<'read'>>` doit donner `{ messageId: MessageId; reader: UserId }`.
   - `PayloadOf<EventOf<'ping'>>` doit donner `never`.
2. **Testez la distributivité :** survolez `PayloadOf<EventOf<'read' | 'ping'>>` dans votre éditeur. Vous obtenez le payload de `read` seul : celui de `ping` était `never` et a disparu.
3. **Écrivez `EventWithoutPayload`**, les événements qui n'ont pas de `payload` (aujourd'hui : `{ type: 'ping' }`). Écrivez un petit type conditionnel qui garde un événement s'il n'a **pas** de `payload` et renvoie `never` sinon, puis appliquez-le à `ChatEvent` : la distributivité fait le reste.
   - Question bonus : c'est exactement ainsi que le type natif `Exclude` est écrit. Pouvez-vous réécrire votre réponse avec `Exclude` ?

**Vérifier :** `npm run ex C2` passe au vert.

### C3 — Le bug de `Batch<E>`

**Notions :** types conditionnels, distributivité et comment la désactiver (`[E] extends […]`)  
**Lancer les tests :** `npm run ex C3`

**Contexte :** le serveur regroupe plusieurs événements dans une même frame, par exemple « Léa a arrêté d'écrire » + « nouveau message de Léa ». Un lot **mélange** donc les types d'événements. `Batch<ChatEvent>` est le type de retour du décodeur (C7).

**Ce que vous allez faire :** comprendre pourquoi un type qui compile est faux, puis le corriger. Ici, la distributivité de C2 devient un bug.

**Étapes :**

1. **Lancez `npm run ex C3` et lisez l'erreur** : `not assignable to parameter of type 'never'`, quand le test ajoute un `typing` dans un lot qui contient déjà un `message`.
2. **Survolez `Batch<ChatEvent>`** dans le test. Vous obtenez `MessageEvent[] | TypingEvent[] | …` : « soit un tableau de messages, soit un tableau de typing… ». La distributivité a appliqué `E[]` à chaque membre séparément. Or on voulait **un** tableau qui accepte tous les événements : `ChatEvent[]`.
3. **Comprenez l'erreur :** pour ajouter un élément dans `A[] | B[]`, TypeScript exige qu'il soit à la fois un `A` et un `B`, ce qui est impossible : `never`.
4. **Désactivez la distribution.** Elle ne s'applique que si le paramètre est « nu ». Entourez les deux côtés de crochets : `[E] extends [ChatEvent] ? E[] : never`. L'union est alors testée d'un seul bloc.

**Vérifier :** `npm run ex C3` passe au vert.

### C4 — `OutgoingEvent`

**Notions :** `Exclude`  
**Lancer les tests :** `npm run ex C4`

**Contexte :** le client envoie lui aussi des événements : ses messages, « j'écris », « lu », ses réactions. En revanche, `system` et `ping` ne viennent que du serveur. `OutgoingEvent` est le type du paramètre de `FakeChatServer.send()` : le compilateur empêche alors la page d'envoyer un événement réservé au serveur.

**Étape :** écrivez `OutgoingEvent`, tous les événements de `ChatEvent` sauf `system` et `ping`. `Exclude<Union, Forme>` est l'inverse d'`Extract` (C1) : il **retire** les membres qui correspondent à la forme.

**Vérifier :** `npm run ex C4` passe au vert. Puis, dans `chat-page.ts`, essayez d'écrire `server.send({ type: 'ping' })` : le compilateur refuse.

### C5 — Bus générique : `src/chat/chat-bus.ts`

**Notions :** génériques (méthode générique, inférence depuis un littéral), narrowing, contravariance des paramètres, champs `#privés`  
**Lancer les tests :** `npm run ex C5`

**Contexte :** certaines parties de la page doivent réagir à un type d'événement précis. Par exemple, quand un message de Léa arrive, la page renvoie un accusé de lecture ; une notification système de niveau `warning` part dans la console. Le bus distribue chaque événement aux fonctions abonnées à son type. Ouvrez `chat-page.ts` et cherchez `bus.on(` : aujourd'hui, `event` y vaut `any`.

**Ce que vous allez faire :** rendre `on` générique, pour que `bus.on('typing', (event) => …)` sache que `event` est un événement `typing`, puis écrire le fonctionnement du bus.

**Étapes :**

1. **Rendez `on` générique.** Remplacez sa signature par `on<K extends ChatEventType>(type: K, handler: (event: EventOf<K>) => void): () => void`.
   - Quand on appelle `bus.on('typing', …)`, TypeScript déduit `K = 'typing'` du premier argument, puis type le handler avec `EventOf<'typing'>`.
   - `K extends ChatEventType` refuse un type inconnu comme `'tpying'`.
2. **Stockez les abonnements.** Ajoutez un champ privé, par exemple `#handlers = new Map<ChatEventType, Set<…>>()` : pour chaque type d'événement, l'ensemble des fonctions abonnées.
   - Quel type donner aux fonctions dans le `Set` ? Chacune attend un événement différent. `(event: never) => void` accepte toutes les fonctions à un paramètre : une fonction qui accepte un `typing` peut être rangée comme « fonction qui accepte quelque chose ».
3. **Écrivez `on`** : ajoutez le handler au `Set` du type demandé (créez le `Set` s'il n'existe pas encore), et renvoyez une fonction qui le retire. C'est cette fonction que l'appelant utilisera pour se désabonner.
4. **Écrivez `emit(event)`** : récupérez le `Set` de `event.type` et appelez chaque handler avec l'événement, dans l'ordre d'inscription.
   - Vous aurez besoin d'un cast ici. Il est sûr : `on` est le seul moyen de remplir la `Map`, donc le `Set` de `'typing'` ne contient que des handlers de `typing`. TypeScript ne peut simplement pas suivre ce lien à travers une `Map`.

**Vérifier :** `npm run ex C5` passe au vert. Dans `chat-page.ts`, survolez `event` dans `bus.on('message', (event) => …)` : son type est l'événement `message`, plus `any`.

### C6 — Reducer : `src/chat/chat-reducer.ts`

**Notions :** unions discriminées, narrowing par `switch`, exhaustivité avec `never`, immutabilité (spread), `Partial<Record<…>>`  
**Lancer les tests :** `npm run ex C6`

**Contexte :** l'état affiché (messages, qui écrit, qui a lu, réactions, notifications) est recalculé à chaque événement par une fonction pure `(état, événement) → nouvel état`, puis la page réaffiche tout. Aujourd'hui, seul `message` est géré : pas d'indicateur « écrit… », pas de ✓✓, pas de réactions.

**Ce que vous allez faire :** traiter chaque type d'événement dans le `switch` de `chatReducer`, sans jamais modifier l'état reçu, puis demander au compilateur de vérifier qu'aucun cas n'est oublié.

**Étapes :**

1. **Lisez le cas `'message'`, déjà écrit.** Dans un `case 'message'`, TypeScript sait que `event` est un événement `message` et donne accès à `event.payload.text`, etc. C'est le **narrowing** d'une union discriminée. Le cas renvoie un **nouvel** objet (`{ ...state, messages: [...] }`) au lieu de modifier `state` : la page compare l'ancien et le nouvel état.
2. **Ajoutez un `case` pour chaque autre type**, sur le même modèle :
   - `'typing'` : ajoutez l'auteur à `typing` s'il écrit, retirez-le sinon, sans jamais l'ajouter deux fois ;
   - `'read'` : ajoutez le lecteur à `readBy[messageId]`, une seule fois par lecteur ;
   - `'reaction'` : ajoutez 1 au compteur de cet emoji pour ce message ;
   - `'system'` : ajoutez le texte à `notices` ;
   - `'ping'` : ne change rien, renvoyez `state`.
3. **Rendez le `switch` exhaustif.** Remplacez `default: return state;` par `default: return assertNever(event);`.
   - Si tous les cas sont traités, `event` vaut `never` dans le `default` : il ne reste plus aucun type possible. `assertNever` n'accepte que `never`, donc ça compile.
   - Si un cas manque, `event` n'est plus `never` dans le `default`, et la compilation échoue en indiquant le type oublié.

**Vérifier :** `npm run ex C6` passe au vert.

**À essayer :**

1. Ajoutez un événement `{ type: 'delete'; payload: { messageId: MessageId } }` à `ChatEvent`, puis lancez `npm run typecheck`. Le compilateur liste tous les endroits à mettre à jour : le reducer (`never`) et le schéma Zod (C7).
2. Annulez la modification.

### C7 — Valider à la frontière : `src/chat/chat-wire.ts`

**Notions :** Zod v4 (`z.discriminatedUnion`, `z.templateLiteral`, `z.enum`, `safeParse`, `z.prettifyError`), `unknown`, template literal types, validation à l'exécution  
**Lancer les tests :** `npm run ex C7`

**Contexte :** tout ce qui précède repose sur l'idée que le serveur respecte `ChatEvent`. Mais les frames arrivent sous forme de texte, et `JSON.parse` renvoie `any` : rien ne garantit qu'un serveur d'une autre version, ou buggé, envoie ce qu'on attend. Les types TypeScript n'existent plus à l'exécution. C'est donc ici, à l'entrée, qu'on vérifie vraiment les données.

**Ce que vous allez faire :** écrire le schéma Zod de `ChatEvent`, puis la fonction qui décode une frame.

**Étapes :**

1. **Écrivez `ChatEventSchema`** avec `z.discriminatedUnion('type', [ … ])` : une liste de `z.object(…)`, un par événement de `ChatEvent`. Zod lit d'abord le champ `type` pour savoir quel objet appliquer, ce qui donne des messages d'erreur précis.
   - Pour `type`, utilisez `z.literal('message')`, `z.literal('typing')`…
   - Pour les identifiants, `z.templateLiteral(['usr_', z.string()])` accepte « `usr_` suivi de n'importe quoi » : c'est l'équivalent Zod de `usr_${string}`.
   - Pour les emojis, `z.enum(EMOJIS)` (à importer depuis `@/chat/chat-events`).
   - N'oubliez pas `ping`, qui n'a pas de `payload`.
2. **Vérifiez que le schéma correspond exactement à `ChatEvent`.** Le test de type compare `z.output<typeof ChatEventSchema>` à `ChatEvent`. Si vous utilisez `z.string()` pour un identifiant, ou si vous oubliez `ping`, il échoue : le schéma et le type TypeScript ne peuvent plus diverger.
3. **Écrivez `parseWireFrame(raw)`.** Elle ne doit jamais lever d'erreur : une frame cassée ne doit pas casser le chat.
   - Appelez `JSON.parse(raw)` dans un `try` / `catch`. Si le JSON est invalide, ou si le résultat n'est pas un tableau (`Array.isArray`), faites un `console.warn` et renvoyez `[]`.
   - Pour chaque élément du tableau, appelez `ChatEventSchema.safeParse(élément)`. Gardez les événements valides ; pour les autres, faites un `console.warn` (`z.prettifyError(result.error)` rend l'erreur lisible) et passez au suivant.
   - Le type de retour est `Batch<ChatEvent>` : c'est ici que le correctif de C3 sert.

**Vérifier :** `npm run ex C7` passe au vert. Ouvrez la console du navigateur sur `#/chat` : les deux frames cassées du serveur sont écartées, et le chat continue de fonctionner.

---

## Cas 3 — Vidéos (40 min)

**Page :** `#/media`.
**Tests :** `tests/3-media/`. Ils tournent dans `happy-dom`, un DOM implémenté en Node.

**Le parcours :** une grille de vidéos. Chaque carte montre une affiche ; au survol, un court extrait muet se lance à la place. Un clic ouvre le lecteur, avec ses boutons (lecture, ±5 s, volume) et ses raccourcis clavier, puis les commentaires de la vidéo.

**Déjà codé :**

- le tag `html` (Module B) : `` html`<p>${texte}</p>` `` produit du HTML en échappant les valeurs insérées ;
- les mixins `Playable`, `Seekable`, `Audible` (Module D) ;
- le décorateur `@logged`, qui écrit chaque appel de méthode dans la console ;
- `media-page.ts`, qui construit la grille, le lecteur et les commentaires.

### M1 — `mediaCard()` : `src/media/media-card.ts`

**Notions :** templating (tag `html`, `SafeHtml`), template literal types (`${string}.avif`), `<picture>` / `<source>`  
**Lancer les tests :** `npm run ex M1`

**Contexte :** `media-page.ts` appelle `mediaCard(media)` pour chaque vidéo du catalogue (`CATALOG`, dans `media-types.ts`) et insère le HTML obtenu. PXO veut l'affiche en AVIF, plus léger, quand le navigateur le supporte, et en JPEG sinon. La balise `<picture>` règle ce choix sans aucun JavaScript.

**Ce que vous allez faire :** écrire le HTML d'une carte avec le tag `html`. Le HTML attendu est écrit en commentaire au-dessus de la fonction.

**Étapes :**

1. **Écrivez l'image.** Un `<picture>` contient une `<source type="image/avif" srcset="…">` puis un `<img src="…">` JPEG. Le navigateur prend la première `<source>` dont il sait lire le `type`, et se rabat sur l'`<img>` sinon.
2. **Écrivez l'aperçu vidéo :** un `<video class="preview" muted loop playsinline preload="none">` avec une `<source type="video/mp4">`. `preload="none"` évite de télécharger la vidéo avant le survol.
3. **Ajoutez la source WebM seulement si elle existe.** `preview.webm` est facultatif. `${preview.webm && html`…`}` n'insère rien quand la valeur est absente : le tag `html` ignore `undefined` et `false`.
4. **Ajoutez le titre et la durée,** avec `formatDuration(media.durationSeconds)` (déjà importé).
5. **Mettez tous les attributs entre guillemets** : `alt="${title}"`. Sans guillemets, `alt=${title}` s'arrête au premier espace du titre. Le tag `html` échappe les guillemets présents dans la valeur, donc les guillemets autour sont sûrs.

**Vérifier :** `npm run ex M1` passe au vert, et la page `#/media` affiche les trois cartes.

**Et les types ?** Ouvrez `media-types.ts` : `AvifUrl = `${string}.avif``. Essayez d'inverser les URL `avif` et `jpeg` d'une vidéo de `CATALOG` : le compilateur refuse.

### M2 — Le mixin `Previewable` : `src/media/player.ts`

**Notions :** mixins, génériques contraints (`Constructor<T>` + intersection), champs `#privés`, décorateur `@logged` (déjà codé)  
**Lancer les tests :** `npm run ex M2`

**Contexte :** l'extrait au survol et le grand lecteur utilisent la même classe, `VideoPlayer`. Elle est construite en empilant des mixins, chacun apportant une capacité : `Playable` (lecture/pause), `Seekable` (se déplacer dans la vidéo), `Audible` (volume). `Previewable` ajoute l'aperçu au survol, en se servant des méthodes des autres mixins. `media-page.ts` appelle `startPreview()` quand la souris entre sur la carte, et `stopPreview()` quand elle sort.

**Rappel :** un mixin est une fonction qui reçoit une classe et renvoie une sous-classe enrichie. `Playable(BasePlayer)` renvoie « `BasePlayer` + `play()` / `pause()` ». La ligne `class VideoPlayer extends Audible(Previewable(Seekable(Playable(BasePlayer))))` empile ainsi quatre capacités.

**Étapes :**

1. **Lisez `Playable` et `Seekable`** dans le même fichier : ils montrent la forme d'un mixin.
2. **Déclarez ce dont `Previewable` a besoin.** Il appellera `this.play()`, `this.pause()` et `this.seek()`, qui n'existent que si `Playable` et `Seekable` ont été appliqués avant. Écrivez une interface avec ces trois méthodes, puis changez la contrainte : `TBase extends Constructor<BasePlayer & VotreInterface>`.
   - `Constructor<T>` (déjà écrit dans `src/shared/mixins.ts`) veut dire « une classe dont les instances sont des `T` ».
   - Résultat : `Previewable(BasePlayer)` ne compile plus, car `BasePlayer` ne sait pas jouer.
3. **Écrivez `startPreview()`** : retenez si le son était coupé, coupez-le (`this.video.muted = true`), allez à 10 % de la durée avec `this.seek(…)`, puis renvoyez `this.play()`.
   - Mémorisez l'état du son dans un champ privé (`#wasMuted`) déclaré dans la classe du mixin.
   - Passez bien par `this.seek()` et `this.play()`, pas par `this.video` directement : le test vérifie que ces méthodes sont appelées.
4. **Écrivez `stopPreview()`** : mettez en pause, revenez au début (`this.seek(0)`), puis remettez le son comme il était.

**Vérifier :** `npm run ex M2` passe au vert. Survolez une carte dans `#/media` : l'extrait se lance. Dans la console (niveau Verbose), les lignes de `@logged` montrent les appels à `seek` et `play`.

### M3 — Le décorateur de setter `@clamp(min, max)` : `src/shared/clamp.ts`

**Notions :** décorateurs standards (setter, `ClassSetterDecoratorContext`), fabrique de décorateur, générique `This`  
**Lancer les tests :** `npm run ex M3`

**Contexte :** les boutons 🔉 / 🔊 et les flèches ↑ ↓ appellent `changeVolume(±0.1)`. Le navigateur n'accepte qu'un volume entre 0 et 1 : au-delà, il lève une erreur. Plutôt que de vérifier la valeur à chaque appel, on la borne une seule fois, sur le setter `volume` du mixin `Audible`, avec un décorateur.

**Rappel :** on utilise les décorateurs **standards** (TypeScript 5+, sans `experimentalDecorators`). Un décorateur de setter est une fonction qui reçoit le setter d'origine et renvoie le setter qui le remplace. `clamp(0, 1)` est une **fabrique** : elle reçoit les bornes et renvoie le décorateur.

**Étapes :**

1. **Constatez le bug.** Ouvrez une vidéo dans `#/media` et cliquez sur 🔊 alors que le volume est à 100 % : la console affiche une `IndexSizeError`, car le setter a reçu 1,1.
2. **Lisez `clamp` dans `src/shared/clamp.ts`.** La signature est écrite ; le décorateur renvoie pour l'instant le setter d'origine sans rien changer.
3. **Renvoyez un nouveau setter** qui borne la valeur, puis appelle l'original : `function (this: This, value: number) { … setter.call(this, valeurBornée) }`.
   - Utilisez une `function`, pas une fonction fléchée : une fonction fléchée n'a pas son propre `this`, et le setter d'origine a besoin de l'instance.
   - `Math.min(max, Math.max(min, value))` borne une valeur.

**Vérifier :** `npm run ex M3` passe au vert, et le bouton 🔊 ne déclenche plus d'erreur.

### M4 (s'il reste du temps) — Raccourcis clavier typés à partir de la classe : `src/media/player-remote.ts`

**Notions :** mapped types, types conditionnels, `infer`, `keyof`, tuples variadiques (`[C, ...Args]`), `satisfies`, `Parameters`  
**Lancer les tests :** `npm run ex M4`

**Contexte :** `SHORTCUTS` associe une touche à une commande du lecteur et à ses arguments : `ArrowRight → ['skip', 5]`. Aujourd'hui, c'est typé `any` : une faute de frappe (`'skp'`) ou un argument du mauvais type ne se voient qu'au moment où l'on appuie sur la touche. On veut que la liste des commandes et de leurs arguments soit **dérivée** de la classe `VideoPlayer`.

**Étapes :**

1. **Écrivez `MethodKeys<T>`, les noms des méthodes de `T`** (pas ses propriétés, pas ses getters). Pour une classe avec `count`, `get double()`, `increment()` et `reset()`, le résultat doit être `'increment' | 'reset'`. En trois temps :
   - un **mapped type** `{ [K in keyof T]: … }` parcourt chaque propriété de `T` ;
   - pour chacune, un type conditionnel renvoie `K` si `T[K]` est une fonction (`T[K] extends (...args: never[]) => unknown`), `never` sinon ;
   - enfin, `{ … }[keyof T]` réunit toutes les valeurs obtenues : les `never` disparaissent, il reste les noms de méthodes.
2. **Écrivez `ArgsOf<T, K>`, les paramètres de la méthode `K`.** `ArgsOf<VideoPlayer, 'seek'>` doit donner `[seconds: number]`.
   - Essayez d'abord `Parameters<T[K]>` : ça ne compile pas, car `Parameters` exige une fonction et TypeScript ne peut pas prouver que `T[K]` en est une.
   - Écrivez donc le type conditionnel vous-même, avec `infer` : si `T[K]` est une fonction, capturez ses paramètres.
3. **Écrivez `Shortcut`, une commande suivie de ses arguments.** `['skip', 5]` est accepté, `['skip', '5']` et `['seek']` sont refusés.
   - Construisez un objet type qui associe à chaque commande `C` le tuple `[C, ...ArgsOf<VideoPlayer, C>]`, puis indexez-le par `PlayerCommand` pour obtenir l'union de tous les tuples.
4. **Constatez le résultat :** `SHORTCUTS` est vérifié par `satisfies Record<string, Shortcut>`. Remplacez `['skip', 5]` par `['skip', '5']` : le compilateur refuse.

**Vérifier :** `npm run ex M4` passe au vert.

### M5 (optionnel) — Playwright : `tests/e2e/M5-media.e2e.ts`

**Notions :** Playwright (`hover`, `locator.evaluate`, `expect.poll`)  
**Lancer les tests :** `npm run ex M5`

**Contexte :** les tests de M1 vérifient le HTML produit, mais `happy-dom` ne décode ni images ni vidéos. Seul un vrai navigateur peut confirmer qu'il a choisi l'AVIF et que l'extrait joue.

**Étapes :**

1. **Vérifiez que le navigateur choisit l'AVIF.** `img.currentSrc` contient l'URL réellement retenue par le navigateur. Lisez-la avec `locator.evaluate((img: HTMLImageElement) => img.currentSrc)`, dans un `expect.poll(…)` : l'image n'est peut-être pas encore chargée, `expect.poll` réessaie jusqu'à ce que la condition soit vraie.
2. **Vérifiez l'aperçu au survol.** Survolez la première carte (`locator.hover()`), puis vérifiez que la vidéo `video.preview` joue (`!paused`) sans le son (`muted`). Éloignez la souris (`page.mouse.move(0, 0)`) et vérifiez qu'elle est en pause et revenue au début (`currentTime === 0`).

**Vérifier :** `npm run ex M5` affiche 2 tests verts.

---

## Bonus

### B1 — Recherche de pays : `src/shared/search.ts`

**Notions :** génériques à 2 paramètres (`K extends KeysMatching<T, string>`), mapped types, types conditionnels, `never`  
**Lancer les tests :** `npm run ex B1`

**Contexte :** le formulaire d'inscription a un champ « Search a country » qui filtre la liste des pays. Il appelle `searchBy(COUNTRIES, 'name', saisie)`. Tant que l'exercice n'est pas fait, la liste n'est pas filtrée.

**Étapes :**

1. **Écrivez `KeysMatching<T, V>`, les clés de `T` dont la valeur est de type `V`.** `KeysMatching<{ id: number; name: string }, string>` doit donner `'name'`. Même technique que `MethodKeys` en M4 : mapped type, conditionnel, puis `[keyof T]`. Ajoutez `-?` après la clé (`[K in keyof T]-?`) pour que les propriétés facultatives n'ajoutent pas `undefined` au résultat.
2. **Rendez `searchBy` générique** avec deux paramètres : `T` pour le type des éléments, `K extends KeysMatching<T, string>` pour la clé. `searchBy(users, 'age', '42')` doit être refusé si `age` est un nombre.
3. **Écrivez le corps :** gardez les éléments dont la propriété `key`, passée dans `normalize()` (déjà écrite : minuscules, sans accents), contient la recherche normalisée.

**Vérifier :** `npm run ex B1` passe au vert, et la recherche « suis » ne laisse que la Suisse dans le formulaire.

### B2 — Offres premium : `src/premium/offers.ts`

**Notions :** `Exclude`, unions discriminées, exhaustivité avec `never`, `as const satisfies`  
**Lancer les tests :** `npm run ex B2`

**Contexte :** la page `#/premium` affiche les formules (gratuite, mensuelle, annuelle, à vie) et le coût mensuel de celle qu'on choisit. `Offer` est une union discriminée sur `kind`.

**Étapes :**

1. **Écrivez `PaidOffer`**, toutes les offres sauf la gratuite, avec `Exclude`.
2. **Écrivez `monthlyCost(offer)`**, le coût par mois d'une offre payante : le prix mensuel, le prix annuel divisé par 12, ou le prix à vie divisé par 36. Utilisez un `switch` sur `offer.kind`, et rendez-le exhaustif comme en C6.
3. **Écrivez `priceLabel(offer)`** avec les libellés donnés en commentaire, en formatant les prix avec `formatPrice` (déjà importé).

**Vérifier :** `npm run ex B2` passe au vert, et la page `#/premium` affiche les prix.

### B3 — Commentaires en fil de discussion : `src/comments/comments.ts`

**Notions :** types récursifs, schéma Zod récursif (getter), génériques F-bounded, `z.templateLiteral`  
**Lancer les tests :** `npm run ex B3`

**Contexte :** les commentaires, affichés sous le lecteur, sont en fil de discussion : chaque commentaire peut avoir des réponses, qui ont elles-mêmes des réponses. `CommentNode` est un type **récursif** : il se contient lui-même (`replies: CommentNode[]`).

**Étapes :**

1. **Écrivez `CommentSchema`**, le schéma Zod de `CommentNode` (le texte doit faire au moins 1 caractère). Un schéma ne peut pas se citer lui-même pendant qu'on l'écrit… sauf dans un getter, lu plus tard : `get replies() { return z.array(CommentSchema); }`.
2. **Rendez `countNodes` et `flattenTree` génériques**, pour qu'elles marchent sur n'importe quel arbre dont les nœuds ont des `replies` du même type : commentaires, menus, dossiers…
   - Contrainte : `T extends { replies: readonly T[] }`. `T` apparaît dans sa propre contrainte : « un nœud dont les réponses sont des nœuds du même type ».
   - `countNodes` compte tous les nœuds, à toutes les profondeurs.
   - `flattenTree` renvoie la liste des nœuds en profondeur d'abord (un parent, puis ses réponses), chacun avec sa profondeur (`depth`, 0 pour le premier niveau).

**Vérifier :** `npm run ex B3` passe au vert. Ouvrez la première vidéo : ses 5 commentaires s'affichent en fil. Le fil de la deuxième vidéo contient une réponse vide, invalide : la page le signale.

---

Formateur : voir [`formateur-README.md`](formateur-README.md) (déroulé minuté, réponses, pièges, mode solution).
