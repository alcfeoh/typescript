// Solution — C5.
import type { ChatEvent } from '@/chat/chat-events';
import type { ChatEventType, EventOf } from '@/chat/chat-types';

type Handler<E> = (event: E) => void;

export class ChatBus {
  // Storage cannot be typed per key with a Map: we store "handlers of some event".
  readonly #handlers = new Map<ChatEventType, Set<Handler<never>>>();

  // K is inferred from the first argument ('typing'), then EventOf<K> types the handler.
  on<K extends ChatEventType>(type: K, handler: Handler<EventOf<K>>): () => void {
    const handlers = this.#handlers.get(type) ?? new Set();
    this.#handlers.set(type, handlers);
    // Handler<EventOf<K>> is assignable to Handler<never>: a function that accepts some event
    // can be stored as a function that accepts "nothing in particular" (parameter contravariance).
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  }

  emit<E extends ChatEvent>(event: E): void {
    // The one cast of the bus: we KNOW this set only holds handlers of event.type,
    // because `on` is the only way in. TypeScript cannot follow that link through a Map.
    const handlers = this.#handlers.get(event.type) as Set<Handler<E>> | undefined;
    handlers?.forEach((handler) => handler(event));
  }
}
