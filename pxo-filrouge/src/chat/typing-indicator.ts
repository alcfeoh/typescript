// Pre-coded — used by the chat composer. T1 asks you to test it.
//
// Calls onChange(true) on the first keystroke, then onChange(false) once the user
// has not typed anything for `idleDelayMs`. stop() ends it immediately (message sent).

export interface TypingIndicator {
  keystroke(): void;
  stop(): void;
}

export function createTypingIndicator(onChange: (isTyping: boolean) => void, idleDelayMs = 2000): TypingIndicator {
  // setTimeout returns a number in browsers and a Timeout object in Node:
  // ReturnType<typeof setTimeout> is right in both.
  let timer: ReturnType<typeof setTimeout> | undefined;
  let typing = false;

  function setTyping(value: boolean): void {
    if (typing === value) return;
    typing = value;
    onChange(value);
  }

  return {
    keystroke() {
      setTyping(true);
      clearTimeout(timer);
      timer = setTimeout(() => setTyping(false), idleDelayMs);
    },
    stop() {
      clearTimeout(timer);
      setTyping(false);
    },
  };
}
