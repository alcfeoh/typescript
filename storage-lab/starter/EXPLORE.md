# LAB L1 — Publier le `Storage<T>` du lab Génériques

Vous avez écrit cette fonctionnalité. Le problème du jour est différent : **comment quelqu'un d'autre l'installe et s'en sert ?**

```bash
cd starter
npm install
```

---

## Étape 1 — Construire, puis regarder ce qui sort (10 min)

```bash
npm install
npm run build
ls -1 dist/
```

Huit fichiers sortent d'un seul fichier source. **Ouvrez-les** et répondez :

1. Pourquoi **deux** fichiers de code (`index.mjs` et `index.cjs`) et pas un seul ?
2. Ouvrez les deux. Regardez uniquement la **dernière ligne** de chacun. Qu'est-ce qui change ?
3. Ouvrez `dist/index.d.mts`. Où sont passés les corps des méthodes ? Le `<T>` a-t-il survécu ?
4. Toujours dans `dist/index.d.mts` : l'interface `WebStorageLike` de `src/storage.ts` n'y est pas. Pourquoi ?
5. Cherchez `localStorage` dans `dist/index.mjs`. Le bundler l'a laissé tel quel. Qu'est-ce que ça dit de là où cette librairie peut tourner ?
6. À quoi sert `dist/index.d.cjs.map` ? Qui le lit, et quand ? Et `dist/index.d.mts.map` ?

---

## Étape 2 — Essayer de s'en servir (5 min)

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

Lisez le message.

---

## Étape 3 — Déclarer la surface publique (10 min)

Le `package.json` du starter ne dit **nulle part** ce que le paquet expose. C'est ce qui manque.

Ajoutez-y une carte `exports`. Deux règles, et une seule source de vérité :

- une branche `import` et une branche `require`, chacune avec **son propre** `.d.ts` ;
- dans chaque branche, `"types"` en **premier** ;
- **les chemins doivent correspondre à ce que `ls dist/` vous a montré à l'étape 1** — pas à ce que vous imaginez.

Ajoutez aussi `main`, `module`, `types` (les solutions de repli pour les vieux résolveurs), `files`, et `sideEffects`.

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
