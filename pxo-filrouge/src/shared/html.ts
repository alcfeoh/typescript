// Déjà codé — Module B (templating sans framework).
//
// `html` est un tagged template : chaque valeur insérée est échappée pour le HTML,
// sauf si c'est déjà un SafeHtml (le résultat d'un autre appel à `html`).
// C'est ce qui permet d'imbriquer les templates sans double échappement, et sans risque XSS.

export class SafeHtml {
  // Un champ privé rend la classe nominale : un simple `{ markup: string }` n'est pas un SafeHtml.
  readonly #brand = true;
  constructor(readonly markup: string) {}
  toString(): string {
    return this.markup;
  }
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

export type Interpolation = SafeHtml | string | number | boolean | null | undefined | readonly Interpolation[];

function toMarkup(value: Interpolation): string {
  if (value instanceof SafeHtml) return value.markup;
  if (Array.isArray(value)) return value.map(toMarkup).join('');
  if (value === null || value === undefined || value === false) return '';
  return escapeHtml(String(value));
}

export function html(strings: TemplateStringsArray, ...values: Interpolation[]): SafeHtml {
  let markup = strings[0] ?? '';
  values.forEach((value, i) => {
    markup += toMarkup(value) + (strings[i + 1] ?? '');
  });
  return new SafeHtml(markup);
}

export function render(target: Element, content: SafeHtml): void {
  target.innerHTML = content.markup;
}
