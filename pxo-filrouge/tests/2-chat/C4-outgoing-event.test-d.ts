/**
 * C4 — OutgoingEvent — type-level test: checked by tsc, never executed.
 * Run: npm run ex C4
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { ChatEvent } from '@/chat/chat-events';
import type { OutgoingEvent } from '@/chat/chat-types';

// Built with the built-in Extract, so that C3 does not depend on your answer to C1.
declare const message: Extract<ChatEvent, { type: 'message' }>;

declare const typing: Extract<ChatEvent, { type: 'typing' }>;

describe('C4 — OutgoingEvent', () => {
  it('excludes the server-only events', () => {
    expectTypeOf<OutgoingEvent['type']>().toEqualTypeOf<'message' | 'typing' | 'read' | 'reaction'>();
  });
});
