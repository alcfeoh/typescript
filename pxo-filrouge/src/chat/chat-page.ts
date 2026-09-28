// Pre-coded — the chat page (Case 2). It comes to life once C5, C6 and C7 are done.
import { ChatBus } from '@/chat/chat-bus';
import { DISPLAY_NAMES, EMOJIS, ME, type MessageId } from '@/chat/chat-events';
import { chatReducer, initialState, type ChatState, type Message } from '@/chat/chat-reducer';
import { parseWireFrame } from '@/chat/chat-wire';
import { FakeChatServer } from '@/chat/fake-server';
import { createTypingIndicator } from '@/chat/typing-indicator';
import { $ } from '@/shared/dom';
import { html, render, type SafeHtml } from '@/shared/html';
import { TodoError } from '@/shared/todo';

/** Which Case 2 steps are still stubs? */
function missingSteps(): string[] {
  const checks: [string, () => unknown][] = [
    ['C5', () => new ChatBus().on('ping', () => {})],
    ['C7', () => parseWireFrame('[]')],
  ];
  return checks.flatMap(([step, check]) => {
    try {
      check();
      return [];
    } catch (error) {
      if (error instanceof TodoError) return [step];
      throw error;
    }
  });
}

const time = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

function messageView(message: Message, state: ChatState): SafeHtml {
  const mine = message.author === ME;
  const readByOthers = (state.readBy[message.id] ?? []).some((reader) => reader !== message.author);
  const reactions = Object.entries(state.reactions[message.id] ?? {});
  return html`<li class="message ${mine ? 'mine' : ''}" data-id="${message.id}">
    <span class="author">${DISPLAY_NAMES[message.author] ?? message.author}</span>
    <p class="text">${message.text}</p>
    <span class="meta">${time(message.sentAt)} ${mine && readByOthers && html`<span class="read">✓✓ Read</span>`}</span>
    <span class="reactions">
      ${reactions.map(([emoji, count]) => html`<span class="reaction">${emoji} ${count}</span>`)}
      ${!mine && EMOJIS.map((emoji) => html`<button class="react" data-emoji="${emoji}" aria-label="React ${emoji}">${emoji}</button>`)}
    </span>
  </li>`;
}

function chatView(state: ChatState): SafeHtml {
  const typing = state.typing.filter((user) => user !== ME);
  return html`
    <ul class="notices">${state.notices.map((notice) => html`<li>${notice}</li>`)}</ul>
    <ol class="messages">${state.messages.map((message) => messageView(message, state))}</ol>
    <p class="typing" aria-live="polite">
      ${typing.map((user) => DISPLAY_NAMES[user] ?? user).join(', ')}${typing.length > 0 && ' is typing…'}
    </p>`;
}

export function mountChat(root: HTMLElement): () => void {
  const missing = missingSteps();
  if (missing.length > 0) {
    render(root, html`<section class="card todo"><h2>Chat</h2>
      <p>⚠️ Complete ${missing.join(' and ')} to bring the chat to life (C6 makes it complete).</p></section>`);
    return () => {};
  }

  render(
    root,
    html`<section class="card chat">
      <h2>Support chat</h2>
      <div id="chat-log"></div>
      <form id="composer">
        <label>Your message <input name="text" autocomplete="off" /></label>
        <button type="submit">Send</button>
      </form>
    </section>`,
  );

  const log = $('#chat-log', root);
  const form = $<HTMLFormElement>('#composer', root);
  const input = $<HTMLInputElement>('input[name=text]', form);

  const server = new FakeChatServer();
  const bus = new ChatBus();
  let state = initialState;

  // Side effects live in bus handlers; the state lives in the reducer.
  bus.on('message', (event) => {
    if (event.payload.author !== ME) {
      server.send({ type: 'read', payload: { messageId: event.payload.id, reader: ME } });
    }
  });
  bus.on('system', (event) => {
    if (event.payload.level === 'warning') console.warn(event.payload.text);
  });

  server.onFrame((frame) => {
    for (const event of parseWireFrame(frame)) {
      state = chatReducer(state, event);
      bus.emit(event);
    }
    render(log, chatView(state));
  });

  const typing = createTypingIndicator((isTyping) =>
    server.send({ type: 'typing', payload: { author: ME, isTyping } }),
  );
  input.addEventListener('input', () => typing.keystroke());

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    typing.stop();
    server.send({ type: 'message', payload: { id: `msg_${Date.now()}`, author: ME, text, sentAt: Date.now() } });
    input.value = '';
  });

  log.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button.react');
    const messageId = button?.closest<HTMLElement>('[data-id]')?.dataset.id as MessageId | undefined;
    const emoji = EMOJIS.find((e) => e === button?.dataset.emoji);
    if (messageId && emoji) server.send({ type: 'reaction', payload: { messageId, author: ME, emoji } });
  });

  server.connect();
  return () => server.disconnect();
}
