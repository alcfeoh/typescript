/** Levée par chaque exercice pas encore fait. Les pages l'interceptent et affichent l'étape manquante. */
export class TodoError extends Error {
  constructor(readonly step: string) {
    super(`Exercise ${step} is not done yet`);
    this.name = 'TodoError';
  }
}

export function todo(step: string): never {
  throw new TodoError(step);
}
