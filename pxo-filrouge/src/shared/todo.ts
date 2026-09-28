/** Thrown by every exercise stub. Pages catch it and show which step is missing. */
export class TodoError extends Error {
  constructor(readonly step: string) {
    super(`Exercise ${step} is not done yet`);
    this.name = 'TodoError';
  }
}

export function todo(step: string): never {
  throw new TodoError(step);
}
