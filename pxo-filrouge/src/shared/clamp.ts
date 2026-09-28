// M3 — A setter decorator (TC39 standard decorators, no `experimentalDecorators`).
//
//   class Audible { @clamp(0, 1) set volume(value: number) { this.video.volume = value; } }
//   player.volume = 1.4   →  the setter receives 1
//
// Why it matters here: HTMLMediaElement.volume THROWS (IndexSizeError) outside [0, 1].

/**
 * Returns the decorator. A setter decorator receives the original setter and returns
 * the setter that replaces it.
 * TODO M3: return a setter that clamps the value between min and max, then calls the original one.
 */
export function clamp(min: number, max: number) {
  return function <This>(
    setter: (this: This, value: number) => void,
    context: ClassSetterDecoratorContext<This, number>,
  ): (this: This, value: number) => void {
    return setter; // TODO M3
  };
}
