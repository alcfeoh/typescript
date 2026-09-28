/**
 * Case 2 — Chat: type-level tests (C1–C5, C7).
 * Checked by tsc through Vitest: a type error here is a failed test.
 */
import { describe, expectTypeOf, it } from 'vitest';
import type * as z from 'zod';
import { ChatBus } from '@/chat/chat-bus';
import type { ChatEvent, Emoji, MessageId, UserId } from '@/chat/chat-events';
import type { Batch, ChatEventType, EventOf, EventWithoutPayload, OutgoingEvent, PayloadOf } from '@/chat/chat-types';
import type { ChatEventSchema } from '@/chat/chat-wire';

// Built with the built-in Extract, so that C3 does not depend on your answer to C1.
declare const message: Extract<ChatEvent, { type: 'message' }>;
declare const typing: Extract<ChatEvent, { type: 'typing' }>;

describe('C1 — ChatEventType & EventOf', () => {
  it('lists every event type', () => {
    expectTypeOf<ChatEventType>().toEqualTypeOf<'message' | 'typing' | 'read' | 'reaction' | 'system' | 'ping'>();
  });

  it('picks ONE member of the union', () => {
    expectTypeOf<EventOf<'typing'>>().toEqualTypeOf<{
      type: 'typing';
      payload: { author: UserId; isTyping: boolean };
    }>();
    expectTypeOf<EventOf<'ping'>>().toEqualTypeOf<{ type: 'ping' }>();
  });

  it('works with several types at once', () => {
    expectTypeOf<EventOf<'read' | 'ping'>['type']>().toEqualTypeOf<'read' | 'ping'>();
  });
});

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

describe('C3 — Batch must NOT distribute', () => {
  it('a batch of chat events is ONE array that mixes event types', () => {
    expectTypeOf<Batch<ChatEvent>>().toEqualTypeOf<ChatEvent[]>();
  });

  it('…so you can push a typing event after a message', () => {
    const batch: Batch<ChatEvent> = [];
    batch.push(message);
    batch.push(typing);
  });

  it('still only accepts chat events', () => {
    expectTypeOf<Batch<string>>().toBeNever();
  });
});

describe('C4 — OutgoingEvent', () => {
  it('excludes the server-only events', () => {
    expectTypeOf<OutgoingEvent['type']>().toEqualTypeOf<'message' | 'typing' | 'read' | 'reaction'>();
  });
});

describe('C5 — ChatBus.on is generic', () => {
  const bus = new ChatBus();

  it('narrows the event in the handler', () => {
    bus.on('typing', (event) => {
      expectTypeOf(event).toEqualTypeOf<Extract<ChatEvent, { type: 'typing' }>>();
      expectTypeOf(event.payload.isTyping).toBeBoolean();
    });
  });

  it('rejects an unknown event type', () => {
    // @ts-expect-error — 'tpying' is not a ChatEventType
    bus.on('tpying', () => {});
  });

  it('returns the unsubscribe function', () => {
    expectTypeOf(bus.on('ping', () => {})).toEqualTypeOf<() => void>();
  });
});

describe('C7 — the Zod schema and the TypeScript union agree', () => {
  it('ChatEventSchema outputs exactly ChatEvent', () => {
    expectTypeOf<z.output<typeof ChatEventSchema>>().toEqualTypeOf<ChatEvent>();
  });
});
