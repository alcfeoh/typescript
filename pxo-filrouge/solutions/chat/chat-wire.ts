// Solution — C7.
import * as z from 'zod';
import { EMOJIS, type ChatEvent } from '@/chat/chat-events';
import type { Batch } from '@/chat/chat-types';

// z.templateLiteral is the runtime twin of a template literal type: its output is `usr_${string}`.
const UserIdSchema = z.templateLiteral(['usr_', z.string()]);
const MessageIdSchema = z.templateLiteral(['msg_', z.string()]);

export const ChatEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('message'),
    payload: z.object({ id: MessageIdSchema, author: UserIdSchema, text: z.string(), sentAt: z.number() }),
  }),
  z.object({
    type: z.literal('typing'),
    payload: z.object({ author: UserIdSchema, isTyping: z.boolean() }),
  }),
  z.object({
    type: z.literal('read'),
    payload: z.object({ messageId: MessageIdSchema, reader: UserIdSchema }),
  }),
  z.object({
    type: z.literal('reaction'),
    payload: z.object({ messageId: MessageIdSchema, author: UserIdSchema, emoji: z.enum(EMOJIS) }),
  }),
  z.object({
    type: z.literal('system'),
    payload: z.object({ level: z.enum(['info', 'warning']), text: z.string() }),
  }),
  z.object({ type: z.literal('ping') }),
]);

export function parseWireFrame(raw: string): Batch<ChatEvent> {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    console.warn('Dropped a frame that is not JSON:', raw);
    return [];
  }
  if (!Array.isArray(data)) {
    console.warn('Dropped a frame that is not a batch:', raw);
    return [];
  }

  const batch: Batch<ChatEvent> = [];
  for (const item of data) {
    const result = ChatEventSchema.safeParse(item);
    if (result.success) batch.push(result.data);
    else console.warn('Dropped an invalid event:', z.prettifyError(result.error));
  }
  return batch;
}
