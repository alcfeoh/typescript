/**
 * Case 2 — Chat: runtime tests (C5, C6, C7). The type-level half is in chat.test-d.ts.
 * Run: npm run test:watch -- 2-chat
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatBus } from '@/chat/chat-bus';
import { BOT, ME, type ChatEvent } from '@/chat/chat-events';
import { chatReducer, initialState } from '@/chat/chat-reducer';
import { parseWireFrame } from '@/chat/chat-wire';

const hello: ChatEvent = {
  type: 'message',
  payload: { id: 'msg_1', author: BOT, text: 'Bonjour', sentAt: 0 },
};
const botTyping: ChatEvent = { type: 'typing', payload: { author: BOT, isTyping: true } };
const botStopped: ChatEvent = { type: 'typing', payload: { author: BOT, isTyping: false } };

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

describe('C6 — chatReducer', () => {
  const reduce = (...events: ChatEvent[]) => events.reduce(chatReducer, initialState);

  it('appends messages', () => {
    expect(reduce(hello).messages).toEqual([hello.payload]);
  });

  it('tracks who is typing, without duplicates', () => {
    expect(reduce(botTyping, botTyping).typing).toEqual([BOT]);
    expect(reduce(botTyping, botStopped).typing).toEqual([]);
  });

  it('records who read a message, once per reader', () => {
    const read: ChatEvent = { type: 'read', payload: { messageId: 'msg_1', reader: ME } };

    expect(reduce(hello, read, read).readBy).toEqual({ msg_1: [ME] });
  });

  it('counts reactions per message and per emoji', () => {
    const react = (emoji: '👍' | '❤️'): ChatEvent => ({
      type: 'reaction',
      payload: { messageId: 'msg_1', author: ME, emoji },
    });

    expect(reduce(hello, react('👍'), react('👍'), react('❤️')).reactions).toEqual({
      msg_1: { '👍': 2, '❤️': 1 },
    });
  });

  it('keeps system notices, and ignores pings', () => {
    const notice: ChatEvent = { type: 'system', payload: { level: 'info', text: 'Connected' } };
    const state = reduce(notice, { type: 'ping' });

    expect(state.notices).toEqual(['Connected']);
    expect(state).toEqual({ ...initialState, notices: ['Connected'] });
  });

  it('never mutates the previous state', () => {
    const before = structuredClone(initialState);
    reduce(hello, botTyping, { type: 'read', payload: { messageId: 'msg_1', reader: ME } });

    expect(initialState).toEqual(before);
  });
});

describe('C7 — parseWireFrame', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses a valid batch, in order', () => {
    expect(parseWireFrame(JSON.stringify([botTyping, hello]))).toEqual([botTyping, hello]);
  });

  it('returns an empty batch for broken JSON, or JSON that is not an array', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(parseWireFrame('{ this is not JSON')).toEqual([]);
    expect(parseWireFrame('{"type":"ping"}')).toEqual([]);
  });

  it('skips invalid events, warns, and keeps the valid ones', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const frame = JSON.stringify([
      { type: 'ping' },
      { type: 'message', payload: { id: 42 } }, // id must be "msg_…", author, text, sentAt are missing
      { type: 'dance' }, // unknown type
      hello,
    ]);

    expect(parseWireFrame(frame)).toEqual([{ type: 'ping' }, hello]);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('rejects ids that do not follow the template (msg_…, usr_…)', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const frame = JSON.stringify([{ type: 'read', payload: { messageId: '1', reader: 'me' } }]);

    expect(parseWireFrame(frame)).toEqual([]);
  });

  it('rejects an unknown emoji', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const frame = JSON.stringify([{ type: 'reaction', payload: { messageId: 'msg_1', author: ME, emoji: '🍕' } }]);

    expect(parseWireFrame(frame)).toEqual([]);
  });
});
