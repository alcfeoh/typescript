// M3 — Un décorateur de setter (décorateurs standards TC39, sans `experimentalDecorators`).
//
//   class Audible { @clamp(0, 1) set volume(value: number) { this.video.volume = value; } }
//   player.volume = 1.4   →  le setter reçoit 1
//
// Pourquoi c'est utile ici : HTMLMediaElement.volume LÈVE une erreur (IndexSizeError) en dehors de [0, 1].

/**
 * Renvoie le décorateur. Un décorateur de setter reçoit le setter d'origine et renvoie
 * le setter qui le remplace.
 * TODO M3 : renvoyez un setter qui borne la valeur entre min et max, puis appelle celui d'origine.
 */
export function clamp(min: number, max: number) {
  return function <This>(
    setter: (this: This, value: number) => void,
    context: ClassSetterDecoratorContext<This, number>,
  ): (this: This, value: number) => void {
    return setter; // TODO M3
  };
}
