// Solution — C1 à C4.
import type { ChatEvent } from '@/chat/chat-events';

// C1 — l'accès indexé sur une union donne l'union des valeurs de cette propriété.
export type ChatEventType = ChatEvent['type'];

// Extract<T, U> garde les membres de T assignables à U. Il se distribue sur T.
export type EventOf<K extends ChatEventType> = Extract<ChatEvent, { type: K }>;

// C2 — `infer P` déclare une variable de type que TS remplit en comparant au motif.
// E est un paramètre « nu » : le conditionnel se distribue quand E est une union.
export type PayloadOf<E> = E extends { payload: infer P } ? P : never;

// Distributivité utilisée exprès : chaque membre de l'union est testé seul,
// ceux qui ne correspondent pas deviennent never, et never disparaît d'une union.
type WithoutPayload<E> = E extends { payload: unknown } ? never : E;
export type EventWithoutPayload = WithoutPayload<ChatEvent>;
// C'est exactement ainsi que le type natif Exclude est écrit : Exclude<ChatEvent, { payload: unknown }>

// C3 — entourer les deux côtés de crochets ([E] extends [ChatEvent]) coupe la distribution :
// l'union est testée d'un seul bloc, et on obtient UN tableau de l'union.
export type Batch<E> = [E] extends [ChatEvent] ? E[] : never;

// C4 — Exclude<T, U> est l'inverse d'Extract : il retire les membres assignables à U.
export type OutgoingEvent = Exclude<ChatEvent, { type: 'system' | 'ping' }>;
