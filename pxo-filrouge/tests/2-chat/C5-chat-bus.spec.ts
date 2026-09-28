/**
 * C5 — ChatBus — runtime test.
 * Run: npm run ex C5
 */
import { describe, expect, it, vi } from 'vitest';
import { ChatBus } from '@/chat/chat-bus';
import { BOT, type ChatEvent } from '@/chat/chat-events';

const hello: ChatEvent = {
  type: 'message',
  payload: { id: 'msg_1', author: BOT, text: 'Bonjour', sentAt: 0 },
};

describe('C5 — ChatBus', () => {
  it('calls the handlers of the emitted type only', () => {
    const bus = new ChatBus();
    const onMessage = vi.fn();
    const onTyping = vi.fn();
    bus.on('message', onMessage);
    bus.on('typing', onTyping);

    bus.emit(hello);

    expect(onMessage).toHaveBeenCalledExactlyOnceWith(hello);
    expect(onTyping).not.toHaveBeenCalled();
  });

  it('supports several handlers for the same type, in order', () => {
    const bus = new ChatBus();
    const calls: string[] = [];
    bus.on('message', () => calls.push('first'));
    bus.on('message', () => calls.push('second'));

    bus.emit(hello);

    expect(calls).toEqual(['first', 'second']);
  });

  it('stops calling a handler once unsubscribed', () => {
    const bus = new ChatBus();
    const handler = vi.fn();
    const unsubscribe = bus.on('message', handler);

    unsubscribe();
    bus.emit(hello);

    expect(handler).not.toHaveBeenCalled();
  });
});
