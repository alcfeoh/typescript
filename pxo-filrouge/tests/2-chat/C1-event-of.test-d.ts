/**
 * C1 — ChatEventType et EventOf — tests de types : vérifiés par tsc, jamais exécutés.
 * Lancer : npm run ex C1
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { ChatEvent, UserId } from '@/chat/chat-events';
import type { ChatEventType, EventOf } from '@/chat/chat-types';

// Construits avec le Extract natif, pour que ce test ne dépende pas de votre réponse à C1.
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
