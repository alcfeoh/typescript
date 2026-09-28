// Pre-coded — Module B (templating without a framework).
//
// `html` is a tagged template: every interpolated value is HTML-escaped,
// unless it is already SafeHtml (the result of another `html` call).
// That is what makes nested templates composable without double escaping, and XSS-safe.

export class SafeHtml {
  // A private field makes the class nominal: a plain `{ markup: string }` is not a SafeHtml.
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
