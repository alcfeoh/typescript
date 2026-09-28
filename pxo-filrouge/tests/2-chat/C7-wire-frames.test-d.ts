/**
 * C7 — the Zod schema and the TypeScript union agree — type-level test: checked by tsc, never executed.
 * Run: npm run ex C7
 */
import { describe, expectTypeOf, it } from 'vitest';
import type * as z from 'zod';
import type { ChatEvent } from '@/chat/chat-events';
import type { ChatEventSchema } from '@/chat/chat-wire';

describe('C7 — the Zod schema and the TypeScript union agree', () => {
  it('ChatEventSchema outputs exactly ChatEvent', () => {
    expectTypeOf<z.output<typeof ChatEventSchema>>().toEqualTypeOf<ChatEvent>();
  });
});
