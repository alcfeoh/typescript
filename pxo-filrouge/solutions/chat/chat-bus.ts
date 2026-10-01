// Solution — C5.
import type { ChatEvent } from '@/chat/chat-events';
import type { ChatEventType, EventOf } from '@/chat/chat-types';

type Handler<E> = (event: E) => void;

export class ChatBus {
  // Une Map ne peut pas typer ses valeurs clé par clé : on stocke des « handlers d'un événement quelconque ».
  readonly #handlers = new Map<ChatEventType, Set<Handler<never>>>();

  // K est déduit du premier argument ('typing'), puis EventOf<K> type le handler.
  on<K extends ChatEventType>(type: K, handler: Handler<EventOf<K>>): () => void {
    const handlers = this.#handlers.get(type) ?? new Set();
    this.#handlers.set(type, handlers);
    // Handler<EventOf<K>> est assignable à Handler<never> : une fonction qui accepte un certain événement
    // peut être rangée comme une fonction qui accepte « rien de particulier » (contravariance des paramètres).
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  }

  emit<E extends ChatEvent>(event: E): void {
    // Le seul cast du bus : on SAIT que ce Set ne contient que des handlers de event.type,
    // car `on` est la seule façon de le remplir. TypeScript ne peut pas suivre ce lien à travers une Map.
    const handlers = this.#handlers.get(event.type) as Set<Handler<E>> | undefined;
    handlers?.forEach((handler) => handler(event));
  }
}
