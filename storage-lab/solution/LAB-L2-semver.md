# LAB L2 — Versionner et publier `@formation-ts/typed-storage`

Suite directe du lab L1 : même paquet, même `Storage<T>`. Il est emballé et validé, il s'agit maintenant de lui donner un numéro et de le mettre à disposition.

---

## Partie 1 — Quel bump ? (10 min, en groupe)

`@formation-ts/typed-storage` est en **1.4.2**. Pour chacun de ces changements : `patch`, `minor` ou `major` ?

Le piège du lab : dans une librairie **typée**, un changement de type est un changement d'API, même quand le JavaScript émis est identique.

| # | Changement | Bump ? |
| --- | --- | --- |
| 1 | Ajout d'un second paramètre facultatif : `new Storage<T>(key, defaultValue?)` | |
| 2 | `load()` renvoyait `null` quand la clé n'existait pas ; il renvoie maintenant `undefined` | |
| 3 | Correction : `save()` plantait sur une valeur contenant un caractère ` ` | |
| 4 | Le paramètre `key` passe de `string` à `` `app:${string}` `` (template literal type) | |
| 5 | Ajout d'une méthode `has(): boolean` | |
| 6 | La classe est renommée `Storage` → `TypedStorage`, avec `export { TypedStorage as Storage }` conservé | |
| 7 | `load()` renvoyait `T \| null`, il renvoie maintenant `T \| null \| undefined` | |
| 8 | Passage de `"engines": { "node": ">=20" }` à `">=22"` | |
| 9 | Ajout de `declarationMap: true` : les `.d.ts.map` sont désormais publiés | |
| 10 | Mise à jour de tsdown 0.23 → 0.24 en devDependency, `dist/` inchangé | |

---

## Partie 2 — Le flux changesets (15 min)

Un changeset vous attend déjà dans `.changeset/`. Ouvrez-le, puis :

```bash
npx changeset            # en créer un vous-même : bump + résumé
npx changeset version    # applique les bumps, écrit CHANGELOG.md
git diff                 # regardez précisément ce qui a bougé
```

Vérifié : avec le changeset `minor` fourni, la version passe de **0.1.0 à 0.2.0** et un `CHANGELOG.md` est généré.

`changeset publish` n'est **jamais** joué en salle. À la place :

```bash
npm publish --dry-run    # tout, sauf l'envoi
```

---

## Partie 3 — Le pipeline (10 min, lecture guidée)

Ouvrez `.github/workflows/release.yml`. Trouvez les **trois** conditions sans lesquelles le trusted publishing ne marche pas.

Puis cassez-en une mentalement et prédisez le message d'erreur avant de vérifier.

---

## Corrigé (formateur)

| # | Bump | Pourquoi |
| --- | --- | --- |
| 1 | **minor** | Paramètre facultatif ajouté : tout le code existant compile et se comporte pareil. |
| 2 | **major** | Le consommateur qui teste `=== null` casse silencieusement. Changement de contrat de retour. |
| 3 | **patch** | Correction de bug, comportement documenté enfin respecté. |
| 4 | **major** | Restriction de type : `new Storage('question')` ne compile plus. **Le JavaScript émis est identique** — c'est le cas d'école du module. |
| 5 | **minor** | Nouvelle méthode, rien de cassé. |
| 6 | **minor** | L'alias préserve l'ancien nom : le code existant compile toujours. Sans l'alias, ce serait un major. |
| 7 | **major** | Élargir un type de **retour** casse le consommateur : son `const v: T \| null = storage.load()` ne compile plus. Attention, c'est le sens inverse d'un paramètre — élargir un paramètre est sûr, élargir un retour ne l'est pas. |
| 8 | **major** | On retire le support d'un runtime. `engines` n'est qu'un avertissement npm, mais c'est bien une rupture de contrat. |
| 9 | **patch** | Fichiers ajoutés au tarball, API inchangée. |
| 10 | **aucun** | Une devDependency ne sort pas du tarball. `changeset --empty` si vous voulez tracer le commit. |

**La règle à retenir** : posez-vous la question du point de vue du consommateur — « est-ce que le code qui compilait hier compile encore aujourd'hui ? ». Si non, c'est un **major**, quel que soit le diff.

**Le n°7 est le piège le plus instructif** : la variance. Élargir ce qu'on **accepte** est sûr ; élargir ce qu'on **renvoie** ne l'est pas.

**Partie 3** — les trois conditions : `permissions: id-token: write` (sans lui, pas d'OIDC), `runs-on: ubuntu-latest` (les runners self-hosted ne sont pas supportés), et npm ≥ 11.5.1 (d'où le `npm install -g npm@latest`). Aucun `NPM_TOKEN` nulle part : c'est le point.
