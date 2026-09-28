// Pre-coded — Module D (TC39 standard decorators, TypeScript 5+; no `experimentalDecorators`).

/** Where @logged writes. Tests replace it with a spy. */
export const logger = {
  log: (message: string): void => console.debug(message),
};

/**
 * Method decorator: logs "<Class>.<method>(<args>)" on every call.
 * The generics keep the decorated method's exact signature (This, Args, Return).
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
