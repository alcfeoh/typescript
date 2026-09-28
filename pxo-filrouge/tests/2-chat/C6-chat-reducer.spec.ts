/**
 * C6 — chatReducer — runtime test.
 * Run: npm run ex C6
 */
import { describe, expect, it } from 'vitest';
import { BOT, ME, type ChatEvent } from '@/chat/chat-events';
import { chatReducer, initialState } from '@/chat/chat-reducer';

const hello: ChatEvent = {
  type: 'message',
  payload: { id: 'msg_1', author: BOT, text: 'Bonjour', sentAt: 0 },
};

const botTyping: ChatEvent = { type: 'typing', payload: { author: BOT, isTyping: true } };

const botStopped: ChatEvent = { type: 'typing', payload: { author: BOT, isTyping: false } };

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
