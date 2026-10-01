// Déjà codé — tous les événements que le serveur de chat peut envoyer, sous forme d'union discriminée.
// Le discriminant est `type` : le tester affine tout l'événement, payload compris.

/** Template literal types : un identifiant n'est pas « n'importe quelle chaîne », mais « usr_ » suivi de n'importe quoi. */
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
