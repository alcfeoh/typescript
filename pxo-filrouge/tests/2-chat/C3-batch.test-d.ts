/**
 * C3 — Batch must NOT distribute — type-level test: checked by tsc, never executed.
 * Run: npm run ex C3
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { ChatEvent } from '@/chat/chat-events';
import type { Batch } from '@/chat/chat-types';

// Built with the built-in Extract, so that C3 does not depend on your answer to C1.
declare const message: Extract<ChatEvent, { type: 'message' }>;

declare const typing: Extract<ChatEvent, { type: 'typing' }>;

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
