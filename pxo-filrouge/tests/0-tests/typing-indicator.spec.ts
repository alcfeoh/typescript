/**
 * T1 — Échauffement Vitest (10 min) : src/chat/typing-indicator.ts
 *
 * Lancer :    npm run ex T1
 * Consigne :  le premier test est écrit. Transformez chaque `it.todo` en vrai test.
 * Outils :    vi.fn(), vi.useFakeTimers(), vi.advanceTimersByTime(ms), toHaveBeenCalledTimes / toHaveBeenLastCalledWith
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTypingIndicator } from '@/chat/typing-indicator';

describe('T1 — typing indicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('notifies "typing" on the first keystroke', () => {
    const onChange = vi.fn();
    const indicator = createTypingIndicator(onChange);

    indicator.keystroke();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it.todo('does not notify again while the user keeps typing');

  it.todo('notifies "stopped typing" after 2 s without a keystroke — and not one millisecond before');

  it.todo('restarts the 2 s delay on every keystroke');

  it.todo('stop() notifies immediately, and the pending timer does not fire a second time');
});
