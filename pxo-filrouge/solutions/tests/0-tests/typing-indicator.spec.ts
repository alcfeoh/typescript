// Solution — T1 (Vitest, fake timers).
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

  it('does not notify again while the user keeps typing', () => {
    const onChange = vi.fn();
    const indicator = createTypingIndicator(onChange);

    indicator.keystroke();
    indicator.keystroke();
    indicator.keystroke();

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('notifies "stopped typing" after 2 s without a keystroke — and not one millisecond before', () => {
    const onChange = vi.fn();
    const indicator = createTypingIndicator(onChange);

    indicator.keystroke();
    vi.advanceTimersByTime(1999);
    expect(onChange).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('restarts the 2 s delay on every keystroke', () => {
    const onChange = vi.fn();
    const indicator = createTypingIndicator(onChange);

    indicator.keystroke();
    vi.advanceTimersByTime(1500);
    indicator.keystroke();
    vi.advanceTimersByTime(1500);
    expect(onChange).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('stop() notifies immediately, and the pending timer does not fire a second time', () => {
    const onChange = vi.fn();
    const indicator = createTypingIndicator(onChange);

    indicator.keystroke();
    indicator.stop();
    expect(onChange).toHaveBeenLastCalledWith(false);

    vi.runAllTimers();
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
