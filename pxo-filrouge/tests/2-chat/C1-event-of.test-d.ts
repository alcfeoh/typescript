/**
 * C1 — ChatEventType & EventOf — type-level test: checked by tsc, never executed.
 * Run: npm run ex C1
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { ChatEvent, UserId } from '@/chat/chat-events';
import type { ChatEventType, EventOf } from '@/chat/chat-types';

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
