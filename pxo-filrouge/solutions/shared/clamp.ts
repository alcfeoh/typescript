// Solution — M3.
export function clamp(min: number, max: number) {
  return function <This>(
    setter: (this: This, value: number) => void,
    _context: ClassSetterDecoratorContext<This, number>,
  ): (this: This, value: number) => void {
    return function (this: This, value: number): void {
      setter.call(this, Math.min(max, Math.max(min, value)));
    };
  };
}
