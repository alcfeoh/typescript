// Solution — C6.
import type { ChatEvent, Emoji, MessageId, UserId } from '@/chat/chat-events';
import type { EventOf, PayloadOf } from '@/chat/chat-types';

export type Message = PayloadOf<EventOf<'message'>>;

export interface ChatState {
  messages: Message[];
  typing: UserId[];
  readBy: Partial<Record<MessageId, UserId[]>>;
  reactions: Partial<Record<MessageId, Partial<Record<Emoji, number>>>>;
  notices: string[];
}

export const initialState: ChatState = { messages: [], typing: [], readBy: {}, reactions: {}, notices: [] };

export function chatReducer(state: ChatState, event: ChatEvent): ChatState {
  switch (event.type) {
    case 'message':
      return { ...state, messages: [...state.messages, event.payload] };

    case 'typing': {
      const { author, isTyping } = event.payload;
      const others = state.typing.filter((user) => user !== author);
      return { ...state, typing: isTyping ? [...others, author] : others };
    }

    case 'read': {
      const { messageId, reader } = event.payload;
      const readers = state.readBy[messageId] ?? [];
      if (readers.includes(reader)) return state;
      return { ...state, readBy: { ...state.readBy, [messageId]: [...readers, reader] } };
    }

    case 'reaction': {
      const { messageId, emoji } = event.payload;
      const counts = state.reactions[messageId] ?? {};
      return {
        ...state,
        reactions: { ...state.reactions, [messageId]: { ...counts, [emoji]: (counts[emoji] ?? 0) + 1 } },
      };
    }

    case 'system':
      return { ...state, notices: [...state.notices, event.payload.text] };

    case 'ping':
      return state;

    default:
      // Every case is handled, so `event` is `never` here. Add a member to ChatEvent
      // and forget its case: this line stops compiling.
      return assertNever(event);
  }
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled chat event: ${JSON.stringify(value)}`);
}
