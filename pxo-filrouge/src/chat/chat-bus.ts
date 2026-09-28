// C5 — A type-safe event bus: `on('message', e => …)` knows that e is a message event.
import type { ChatEvent } from '@/chat/chat-events';
import { todo } from '@/shared/todo';

export class ChatBus {
  /**
   * Subscribes to one event type. Returns the function that unsubscribes.
   * TODO C5: make it generic so that the handler receives the NARROWED event:
   *   bus.on('typing', (event) => event.payload.isTyping)   // no cast, no `any`
   *   bus.on('tpying', …)                                    // compile error
   */
  on(type: string, handler: (event: any) => void): () => void {
    return todo('C5');
  }

  /** Calls every handler registered for event.type, in registration order. */
  emit(event: ChatEvent): void {
    todo('C5');
  }
}
