# LAB L1 — Publier le `Storage<T>` du lab Génériques

Vous avez écrit cette fonctionnalité. Le problème du jour est différent : **comment quelqu'un d'autre l'installe et s'en sert ?**

```bash
cd starter
npm install
```

---

## Étape 1 — Construire, puis regarder ce qui sort (10 min)

```bash
npm run build
ls -1 dist/
```

Huit fichiers sortent d'un seul fichier source. **Ouvrez-les** et répondez :

1. Pourquoi **deux** fichiers de code (`index.mjs` et `index.cjs`) et pas un seul ?
2. Ouvrez les deux. Regardez uniquement la **dernière ligne** de chacun. Qu'est-ce qui change ?
3. Ouvrez `dist/index.d.mts`. Où sont passés les corps des méthodes ? Le `<T>` a-t-il survécu ?
4. Toujours dans `dist/index.d.mts` : l'interface `WebStorageLike` de `src/storage.ts` n'y est pas. Pourquoi ?
5. Cherchez `localStorage` dans `dist/index.mjs`. Le bundler l'a laissé tel quel. Qu'est-ce que ça dit de là où cette librairie peut tourner ?
6. À quoi sert `dist/index.mjs.map` ? Qui le lit, et quand ? Et `dist/index.d.mts.map` ?

> Ces six questions sont l'essentiel du lab. Le reste en découle.

---

## Étape 2 — Essayer de s'en servir, et échouer (5 min)

Deux consommateurs vous attendent dans `consumer/` : un en ESM, un en CommonJS. Ils importent le paquet **par son nom**, exactement comme le ferait un utilisateur.

```bash
npm run smoke
```

Ça échoue :

```
Error [ERR_MODULE_NOT_FOUND]:
Cannot find package '@formation-ts/typed-storage'
```

Le build a pourtant réussi et `dist/` est plein. **Pourquoi Node ne trouve-t-il rien ?**

Demandez aussi son avis à l'outillage :

```bash
npx attw --pack .
```

Quatre lignes, quatre têtes de mort. Lisez le message.

---

## Étape 3 — Déclarer la surface publique (10 min)

Le `package.json` du starter ne dit **nulle part** ce que le paquet expose. C'est ça qui manque.

Ajoutez-y une carte `exports`. Deux règles, et une seule source de vérité :

- une branche `import` et une branche `require`, chacune avec **son propre** `.d.ts` ;
- dans chaque branche, `"types"` en **premier** ;
- **les chemins doivent correspondre à ce que `ls dist/` vous a montré à l'étape 1** — pas à ce que vous imaginez.

Ajoutez aussi `main`, `module`, `types` (les replis pour les vieux résolveurs), `files`, et `sideEffects`.

```bash
npm run smoke   # les deux consommateurs doivent passer
```

---

## Étape 4 — Faire valider par les outils (5 min)

```bash
npm run check:exports    # publint + attw
npm pack --dry-run       # ce qui partirait vraiment sur le registre
```

Objectif : `All good!` et quatre lignes vertes.

Regardez la sortie de `npm pack --dry-run`. **Est-ce que `src/` est dedans ? Et `consumer/` ?** Si oui, c'est que `files` n'est pas correct — et vous enverriez vos tests et votre config à tous vos utilisateurs.

---

## Étape 5 — La question qui fâche : `sideEffects` (5 min)

Vous avez déclaré `"sideEffects": false`. C'est une **promesse** faite au bundler du consommateur : « importer ce paquet ne fait rien tout seul ».

Cette librairie touche `localStorage`. **Est-ce que la promesse est un mensonge ?**

Puis : si on ajoutait ceci en haut de `storage.ts`, la réponse changerait-elle ?

```ts
if (typeof localStorage === 'undefined') {
  throw new Error('@formation-ts/typed-storage requires a browser');
}
```

---

## Bonus, si vous avez fini

- La classe s'appelle `Storage`. Le DOM a déjà une interface `Storage`. Qu'est-ce qui se passe chez un consommateur qui a `"lib": ["DOM"]` et fait `import { Storage } from ...` ? Faut-il la renommer ?
- `npm run build` puis `npx publint` : ajoutez `"types"` **après** `"default"` dans une branche de la carte `exports`, relancez `attw`. Qu'est-ce qu'il dit ?
- Retirez `declaration` du `tsconfig.json`, rebuildez, relancez `attw`. Quelle ligne devient rouge ?

---

## Corrigé (formateur)

1. **Deux formats** parce qu'un consommateur ESM fait `import` et un consommateur CJS fait `require` : ce sont deux systèmes de modules incompatibles, et un seul fichier ne peut pas servir les deux correctement.
2. Dernière ligne : `export { Storage };` en ESM, `exports.Storage = Storage;` en CJS. Même classe, deux conventions.
3. Les corps ont disparu : un `.d.ts` ne décrit que les **types**, il ne contient aucun code exécutable. Le `<T>` a survécu — c'est tout l'intérêt, le consommateur garde `Storage<Question>`.
4. `WebStorageLike` n'est pas exportée depuis `index.ts`, donc elle ne fait pas partie de l'API publique. Le générateur de `.d.ts` ne garde que ce qui est atteignable depuis l'entrée.
5. `localStorage` est laissé comme identifiant global libre : la librairie **suppose un environnement qui le fournit**. En Node pur, elle plante — d'où le stub dans `consumer/`. C'est une contrainte à documenter dans le README, pas un bug.
6. `.mjs.map` : la source map JavaScript, lue par le navigateur quand le consommateur ouvre les devtools, pour afficher votre `.ts` au lieu du bundle. `.d.mts.map` : la source map des **types**, lue par l'IDE quand le consommateur fait « aller à la définition » — sans elle il atterrit dans le `.d.ts`, avec elle dans votre `.ts` (à condition de publier `src/`).

**Étape 2** — Node refuse parce que le self-referencing d'un paquet par son propre nom **exige** un champ `exports`. Sans lui, le paquet n'a littéralement pas de porte d'entrée : `dist/` existe mais rien ne dit qu'il est public. C'est le même mécanisme qui fera échouer un `npm install` chez un utilisateur.

**Étape 5** — Non, la promesse tient : la classe ne touche `localStorage` que **quand on appelle une méthode**, jamais au moment de l'import. Avec le `throw` au niveau module, ça devient un mensonge : l'import seul exécute du code et peut lever. Il faudrait alors `"sideEffects": ["./dist/index.mjs"]`, ou mieux, déplacer la vérification dans le constructeur.

**Bonus 1** — Pas de conflit réel : l'import local masque le type global dans ce fichier. Mais c'est déroutant à la lecture et ça casse l'autocomplétion sur le `Storage` du DOM. En vrai on la nommerait `TypedStorage`. C'est une décision d'API — donc, une fois publiée, la renommer serait un **major**.

**Durée** : ~35 minutes. Les étapes 1 et 2 pour tout le monde ; l'étape 5 est la discussion qui fait le plus réfléchir.
