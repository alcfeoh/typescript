// A4 — Dérivez les types dont les pages ont besoin à partir d'account-api.ts, qui ne les exporte pas.
// Outils : ReturnType, Awaited, NonNullable, Parameters, accès indexé (T['clé']).
//
// Chaque type à écrire vaut `any` : tout compile, rien n'est vérifié.
// Remplacez-les un par un — puis lancez `npm run typecheck` et regardez welcome.ts.
import type { signup, uploadAvatar } from '@/account/account-api';

/** Ce que `signup()` renvoie une fois la promesse résolue, null compris. */
export type SignupResponse = any; // TODO A4

/** Une inscription réussie : SignupResponse sans le null. */
export type Session = any; // TODO A4

/** La partie `user` d'une Session. */
export type User = any; // TODO A4

/** L'objet d'options accepté par `uploadAvatar()` (son second paramètre, sans undefined). */
export type UploadOptions = any; // TODO A4
