/**
 * C5 — ChatBus.on is generic — type-level test: checked by tsc, never executed.
 * Run: npm run ex C5
 */
import { describe, expectTypeOf, it } from 'vitest';
import { ChatBus } from '@/chat/chat-bus';
import type { ChatEvent } from '@/chat/chat-events';
import type { ChatEventType } from '@/chat/chat-types';

declare const typing: Extract<ChatEvent, { type: 'typing' }>;

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
