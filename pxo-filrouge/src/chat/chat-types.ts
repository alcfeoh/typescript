// C1–C4 — Types derived from ChatEvent. Each placeholder is `any`: replace it.
// Nothing here is re-typed by hand: when ChatEvent changes, every type below follows.
import type { ChatEvent } from '@/chat/chat-events';

// ---------------------------------------------------------------------------
// C1 — Indexed access & Extract
// ---------------------------------------------------------------------------

/** 'message' | 'typing' | 'read' | 'reaction' | 'system' | 'ping' */
export type ChatEventType = any; // TODO C1

/** EventOf<'typing'> → { type: 'typing'; payload: { author: UserId; isTyping: boolean } } */
export type EventOf<K extends ChatEventType> = any; // TODO C1

// ---------------------------------------------------------------------------
// C2 — Conditional types, infer, and distributivity
// ---------------------------------------------------------------------------

/**
 * The payload of an event, `never` when it has none.
 * PayloadOf<EventOf<'read'>> → { messageId: MessageId; reader: UserId }
 * PayloadOf<EventOf<'ping'>> → never
 */
export type PayloadOf<E> = any; // TODO C2

/** The events that carry no payload at all (today: only ping). */
export type EventWithoutPayload = any; // TODO C2

// ---------------------------------------------------------------------------
// C3 — When distributivity is a bug
// ---------------------------------------------------------------------------

/**
 * The server groups events into batches. A batch MIXES event types:
 *   [message, typing, read]
 * This version compiles, but is wrong — see tests/2-chat/chat.test-d.ts, C3.
 */
export type Batch<E> = E extends ChatEvent ? E[] : never; // TODO C3: fix it

// ---------------------------------------------------------------------------
// C4 — Exclude
// ---------------------------------------------------------------------------

/** What the client may SEND: every event except 'system' and 'ping' (server-only). */
export type OutgoingEvent = any; // TODO C4
