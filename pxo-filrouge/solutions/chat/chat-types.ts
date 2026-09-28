// Solution — C1 to C4.
import type { ChatEvent } from '@/chat/chat-events';

// C1 — indexed access on a union gives the union of that property.
export type ChatEventType = ChatEvent['type'];

// Extract<T, U> keeps the members of T assignable to U. It distributes over T.
export type EventOf<K extends ChatEventType> = Extract<ChatEvent, { type: K }>;

// C2 — `infer P` declares a type variable that TS fills in while matching the pattern.
// E is a naked type parameter: the conditional distributes when E is a union.
export type PayloadOf<E> = E extends { payload: infer P } ? P : never;

// Distributivity used on purpose: each member of the union is tested alone,
// the ones that do not match become never, and never disappears from a union.
type WithoutPayload<E> = E extends { payload: unknown } ? never : E;
export type EventWithoutPayload = WithoutPayload<ChatEvent>;
// That is exactly how the built-in Exclude works: Exclude<ChatEvent, { payload: unknown }>

// C3 — wrapping both sides in a tuple ([E] extends [ChatEvent]) turns distribution off:
// the union is tested as a whole, and we get ONE array of the union.
export type Batch<E> = [E] extends [ChatEvent] ? E[] : never;

// C4 — Exclude<T, U> is the opposite of Extract: it drops the members assignable to U.
export type OutgoingEvent = Exclude<ChatEvent, { type: 'system' | 'ping' }>;
