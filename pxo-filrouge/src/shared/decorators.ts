// Déjà codé — Module D (décorateurs standards TC39, TypeScript 5+ ; sans `experimentalDecorators`).

/** Là où @logged écrit. Les tests le remplacent par un espion. */
export const logger = {
  log: (message: string): void => console.debug(message),
};

/**
 * Décorateur de méthode : écrit "<Classe>.<méthode>(<arguments>)" à chaque appel.
 * Les génériques conservent la signature exacte de la méthode décorée (This, Args, Return).
 */
export function logged<This, Args extends unknown[], Return>(
  method: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
): (this: This, ...args: Args) => Return {
  const name = String(context.name);
  return function (this: This, ...args: Args): Return {
    const owner = (this as object).constructor.name || 'anonymous';
    logger.log(`${owner}.${name}(${args.map((a) => JSON.stringify(a)).join(', ')})`);
    return method.call(this, ...args);
  };
}
