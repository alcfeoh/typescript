/**
 * C2 — PayloadOf (infer) & EventWithoutPayload (distributivity) — type-level test: checked by tsc, never executed.
 * Run: npm run ex C2
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { Emoji, MessageId, UserId } from '@/chat/chat-events';
import type { EventOf, EventWithoutPayload, PayloadOf } from '@/chat/chat-types';

describe('C2 — PayloadOf (infer) & EventWithoutPayload (distributivity)', () => {
  it('extracts the payload of one event', () => {
    expectTypeOf<PayloadOf<EventOf<'read'>>>().toEqualTypeOf<{ messageId: MessageId; reader: UserId }>();
  });

  it('is never for an event without payload', () => {
    expectTypeOf<PayloadOf<EventOf<'ping'>>>().toBeNever();
  });

  it('distributes over a union: the union of the payloads', () => {
    expectTypeOf<PayloadOf<EventOf<'read' | 'ping' | 'reaction'>>>().toEqualTypeOf<
      { messageId: MessageId; reader: UserId } | { messageId: MessageId; author: UserId; emoji: Emoji }
    >();
  });

  it('finds the events that have no payload', () => {
    expectTypeOf<EventWithoutPayload>().toEqualTypeOf<{ type: 'ping' }>();
  });
});
