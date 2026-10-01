// C5 — Un bus d'événements typé : dans `on('message', e => …)`, e est un événement message.
import type { ChatEvent } from '@/chat/chat-events';
import { todo } from '@/shared/todo';

export class ChatBus {
  /**
   * S'abonne à un type d'événement. Renvoie la fonction qui désabonne.
   * TODO C5 : rendez-la générique, pour que le handler reçoive l'événement AFFINÉ :
   *   bus.on('typing', (event) => event.payload.isTyping)   // sans cast, sans `any`
   *   bus.on('tpying', …)                                    // erreur de compilation
   */
  on(type: string, handler: (event: any) => void): () => void {
    return todo('C5');
  }

  /** Appelle chaque handler inscrit pour event.type, dans l'ordre d'inscription. */
  emit(event: ChatEvent): void {
    todo('C5');
  }
}
