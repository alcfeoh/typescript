// C1–C4 — Types dérivés de ChatEvent. Chaque type à écrire vaut `any` : remplacez-le.
// Rien n'est retapé à la main : quand ChatEvent change, tous les types ci-dessous suivent.
import type { ChatEvent } from '@/chat/chat-events';

// ---------------------------------------------------------------------------
// C1 — Accès indexé et Extract
// ---------------------------------------------------------------------------

/** 'message' | 'typing' | 'read' | 'reaction' | 'system' | 'ping' */
export type ChatEventType = any; // TODO C1

/** EventOf<'typing'> → { type: 'typing'; payload: { author: UserId; isTyping: boolean } } */
export type EventOf<K extends ChatEventType> = any; // TODO C1

// ---------------------------------------------------------------------------
// C2 — Types conditionnels, infer et distributivité
// ---------------------------------------------------------------------------

/**
 * Le payload d'un événement, `never` s'il n'en a pas.
 * PayloadOf<EventOf<'read'>> → { messageId: MessageId; reader: UserId }
 * PayloadOf<EventOf<'ping'>> → never
 */
export type PayloadOf<E> = any; // TODO C2

/** Les événements qui n'ont aucun payload (aujourd'hui : seulement ping). */
export type EventWithoutPayload = any; // TODO C2

// ---------------------------------------------------------------------------
// C3 — Quand la distributivité est un bug
// ---------------------------------------------------------------------------

/**
 * Le serveur regroupe les événements en lots. Un lot MÉLANGE les types d'événements :
 *   [message, typing, read]
 * Cette version compile, mais elle est fausse — voir tests/2-chat/C3-batch.test-d.ts (npm run ex C3).
 */
export type Batch<E> = E extends ChatEvent ? E[] : never; // TODO C3 : à corriger

// ---------------------------------------------------------------------------
// C4 — Exclude
// ---------------------------------------------------------------------------

/** Ce que le client a le droit d'ENVOYER : tous les événements sauf 'system' et 'ping' (réservés au serveur). */
export type OutgoingEvent = any; // TODO C4
