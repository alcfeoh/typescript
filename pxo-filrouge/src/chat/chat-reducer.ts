// C6 — The chat state, updated by a reducer: (state, event) → new state. No mutation.
import type { ChatEvent, Emoji, MessageId, UserId } from '@/chat/chat-events';
import type { EventOf, PayloadOf } from '@/chat/chat-types';

export type Message = PayloadOf<EventOf<'message'>>;

export interface ChatState {
  messages: Message[];
  /** Who is typing right now. */
  typing: UserId[];
  /** Who has read each message. */
  readBy: Partial<Record<MessageId, UserId[]>>;
  /** Count of each emoji, per message. */
  reactions: Partial<Record<MessageId, Partial<Record<Emoji, number>>>>;
  /** Text of the system notices, oldest first. */
  notices: string[];
}

export const initialState: ChatState = { messages: [], typing: [], readBy: {}, reactions: {}, notices: [] };

export function chatReducer(state: ChatState, event: ChatEvent): ChatState {
  switch (event.type) {
    case 'message':
      return { ...state, messages: [...state.messages, event.payload] };

    // TODO C6: handle 'typing', 'read', 'reaction', 'system' and 'ping' (see README),
    // then replace this default with the exhaustiveness check below.
    default:
      return state;
  }
}

/** Only accepts `never`: calling it with anything else is a compile error. */
export function assertNever(value: never): never {
  throw new Error(`Unhandled chat event: ${JSON.stringify(value)}`);
}
