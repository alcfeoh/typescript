// C6 — L'état du chat, mis à jour par un reducer : (état, événement) → nouvel état. Sans mutation.
import type { ChatEvent, Emoji, MessageId, UserId } from '@/chat/chat-events';
import type { EventOf, PayloadOf } from '@/chat/chat-types';

export type Message = PayloadOf<EventOf<'message'>>;

export interface ChatState {
  messages: Message[];
  /** Qui est en train d'écrire. */
  typing: UserId[];
  /** Qui a lu chaque message. */
  readBy: Partial<Record<MessageId, UserId[]>>;
  /** Nombre de chaque emoji, par message. */
  reactions: Partial<Record<MessageId, Partial<Record<Emoji, number>>>>;
  /** Texte des notifications système, de la plus ancienne à la plus récente. */
  notices: string[];
}

export const initialState: ChatState = { messages: [], typing: [], readBy: {}, reactions: {}, notices: [] };

export function chatReducer(state: ChatState, event: ChatEvent): ChatState {
  switch (event.type) {
    case 'message':
      return { ...state, messages: [...state.messages, event.payload] };

    // TODO C6 : traitez 'typing', 'read', 'reaction', 'system' et 'ping' (voir README),
    // puis remplacez ce default par la vérification d'exhaustivité ci-dessous.
    default:
      return state;
  }
}

/** N'accepte que `never` : l'appeler avec autre chose est une erreur de compilation. */
export function assertNever(value: never): never {
  throw new Error(`Unhandled chat event: ${JSON.stringify(value)}`);
}
