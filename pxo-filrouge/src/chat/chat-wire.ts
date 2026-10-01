// C7 — Le WebSocket transporte des chaînes. Les types TypeScript disparaissent à l'exécution :
// on valide ce qui arrive, à la frontière, avec Zod.
import * as z from 'zod';
import type { Batch } from '@/chat/chat-types';
import type { ChatEvent } from '@/chat/chat-events';
import { todo } from '@/shared/todo';

/**
 * TODO C7 : z.discriminatedUnion('type', [...]) avec un z.object par événement.
 * Son type de sortie doit être EXACTEMENT ChatEvent — un test de type le vérifie.
 */
export const ChatEventSchema = z.any();

/**
 * Une frame est le texte JSON d'un lot : un tableau d'événements, par exemple
 *   '[{"type":"typing","payload":{…}},{"type":"message","payload":{…}}]'
 *
 * Renvoie les événements valides, dans l'ordre. Ne doit jamais lever d'erreur — une frame cassée ne doit pas casser le chat :
 * - JSON invalide, ou pas un tableau → lot vide
 * - un événement invalide → ignoré (avec un console.warn), les autres sont gardés
 */
export function parseWireFrame(raw: string): Batch<ChatEvent> {
  return todo('C7');
}
