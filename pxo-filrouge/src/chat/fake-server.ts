// Pre-coded — stands in for the WebSocket server. It pushes FRAMES: JSON strings, each one a batch
// of events. On purpose, a few frames are broken (bad JSON, invalid event): C7 must survive them.
import { BOT, type ChatEvent, type MessageId } from '@/chat/chat-events';
import type { OutgoingEvent } from '@/chat/chat-types';

type FrameListener = (frame: string) => void;

const REPLIES = [
  'Merci pour votre message ! Je regarde ça tout de suite.',
  "C'est noté. Autre chose ?",
  'Parfait, bonne journée !',
];

export class FakeChatServer {
  #listeners = new Set<FrameListener>();
  #timers = new Set<ReturnType<typeof setTimeout>>();
  #replies = 0;
  #counter = 0;

  onFrame(listener: FrameListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  connect(): void {
    const hello: MessageId = 'msg_hello';
    this.#later(200, [{ type: 'system', payload: { level: 'info', text: 'Connected to #support' } }]);
    this.#later(700, [{ type: 'typing', payload: { author: BOT, isTyping: true } }]);
    this.#later(1500, [
      { type: 'typing', payload: { author: BOT, isTyping: false } },
      { type: 'message', payload: { id: hello, author: BOT, text: 'Bonjour ! Comment puis-je vous aider ?', sentAt: Date.now() } },
    ]);
    this.#laterRaw(1800, '{ this is not JSON');
    // A valid ping, then a message with an invalid payload: only the ping should get through.
    this.#laterRaw(2000, JSON.stringify([{ type: 'ping' }, { type: 'message', payload: { id: 42 } }]));
  }

  send(event: OutgoingEvent): void {
    this.#later(50, [event]); // echo: the server broadcasts it back
    if (event.type !== 'message') return;

    const messageId: MessageId = event.payload.id;
    const text = REPLIES[this.#replies++ % REPLIES.length] ?? '';
    this.#later(400, [{ type: 'read', payload: { messageId, reader: BOT } }]);
    this.#later(600, [{ type: 'reaction', payload: { messageId, author: BOT, emoji: '👍' } }]);
    this.#later(800, [{ type: 'typing', payload: { author: BOT, isTyping: true } }]);
    this.#later(1600, [
      { type: 'typing', payload: { author: BOT, isTyping: false } },
      { type: 'message', payload: { id: `msg_bot_${++this.#counter}`, author: BOT, text, sentAt: Date.now() } },
    ]);
  }

  disconnect(): void {
    this.#timers.forEach(clearTimeout);
    this.#timers.clear();
    this.#listeners.clear();
  }

  #later(delayMs: number, batch: ChatEvent[]): void {
    this.#laterRaw(delayMs, JSON.stringify(batch));
  }

  #laterRaw(delayMs: number, frame: string): void {
    const timer = setTimeout(() => {
      this.#timers.delete(timer);
      this.#listeners.forEach((listener) => listener(frame));
    }, delayMs);
    this.#timers.add(timer);
  }
}
