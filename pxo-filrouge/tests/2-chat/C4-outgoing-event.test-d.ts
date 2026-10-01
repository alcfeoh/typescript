/**
 * C4 — OutgoingEvent — tests de types : vérifiés par tsc, jamais exécutés.
 * Lancer : npm run ex C4
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { ChatEvent } from '@/chat/chat-events';
import type { OutgoingEvent } from '@/chat/chat-types';

// Construits avec le Extract natif, pour que ce test ne dépende pas de votre réponse à C1.
declare const message: Extract<ChatEvent, { type: 'message' }>;

declare const typing: Extract<ChatEvent, { type: 'typing' }>;

describe('C4 — OutgoingEvent', () => {
  it('excludes the server-only events', () => {
    expectTypeOf<OutgoingEvent['type']>().toEqualTypeOf<'message' | 'typing' | 'read' | 'reaction'>();
  });
});
