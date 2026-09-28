// C7 — The WebSocket delivers strings. TypeScript types vanish at runtime:
// validate what comes in, at the boundary, with Zod.
import * as z from 'zod';
import type { Batch } from '@/chat/chat-types';
import type { ChatEvent } from '@/chat/chat-events';
import { todo } from '@/shared/todo';

/**
 * TODO C7: z.discriminatedUnion('type', [...]) with one z.object per event.
 * Its output type must be EXACTLY ChatEvent — a type-level test checks it.
 */
export const ChatEventSchema = z.any();

/**
 * A frame is the JSON text of a batch: an array of events, e.g.
 *   '[{"type":"typing","payload":{…}},{"type":"message","payload":{…}}]'
 *
 * Returns the valid events, in order. It must never throw — one bad frame must not kill the chat:
 * - not valid JSON, or not an array → empty batch
 * - an invalid event → skipped (console.warn it), the others are kept
 */
export function parseWireFrame(raw: string): Batch<ChatEvent> {
  return todo('C7');
}
