// Déjà codé — utilisé par la zone de saisie du chat. T1 vous demande de le tester.
//
// Appelle onChange(true) à la première frappe, puis onChange(false) dès que l'utilisateur
// n'a rien tapé pendant `idleDelayMs`. stop() l'arrête immédiatement (message envoyé).

export interface TypingIndicator {
  keystroke(): void;
  stop(): void;
}

export function createTypingIndicator(onChange: (isTyping: boolean) => void, idleDelayMs = 2000): TypingIndicator {
  // setTimeout renvoie un nombre dans le navigateur et un objet Timeout dans Node :
  // ReturnType<typeof setTimeout> est juste dans les deux cas.
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
