/**
 * C7 — parseWireFrame — runtime test.
 * Run: npm run ex C7
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BOT, ME, type ChatEvent } from '@/chat/chat-events';
import { parseWireFrame } from '@/chat/chat-wire';

const hello: ChatEvent = {
  type: 'message',
  payload: { id: 'msg_1', author: BOT, text: 'Bonjour', sentAt: 0 },
};

const botTyping: ChatEvent = { type: 'typing', payload: { author: BOT, isTyping: true } };

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
