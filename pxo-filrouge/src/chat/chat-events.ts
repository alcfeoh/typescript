// Pre-coded — every event the chat server can push, as a discriminated union.
// The discriminant is `type`: checking it narrows the whole event, payload included.

/** Template literal types: an id is not "any string", it is "usr_" followed by anything. */
export type UserId = `usr_${string}`;
export type MessageId = `msg_${string}`;

export const EMOJIS = ['👍', '❤️', '😂', '😮'] as const;
export type Emoji = (typeof EMOJIS)[number];

export type ChatEvent =
  | { type: 'message'; payload: { id: MessageId; author: UserId; text: string; sentAt: number } }
  | { type: 'typing'; payload: { author: UserId; isTyping: boolean } }
  | { type: 'read'; payload: { messageId: MessageId; reader: UserId } }
  | { type: 'reaction'; payload: { messageId: MessageId; author: UserId; emoji: Emoji } }
  | { type: 'system'; payload: { level: 'info' | 'warning'; text: string } }
  | { type: 'ping' };

export const ME: UserId = 'usr_me';
export const BOT: UserId = 'usr_lea';

export const DISPLAY_NAMES: Record<UserId, string> = {
  [ME]: 'You',
  [BOT]: 'Léa (support)',
};
