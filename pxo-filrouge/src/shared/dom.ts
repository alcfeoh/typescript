// Pre-coded DOM helpers.

/**
 * querySelector that throws instead of returning null.
 * `T` defaults to HTMLElement: `$('#x')` is an HTMLElement, `$<HTMLInputElement>('#email')` an input.
 * (TypeScript can only infer the element type by itself for bare tag names, e.g. `querySelector('video')`.)
 */
export function $<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`No element matches ${selector}`);
  return element;
}

/** FormData → plain object. Repeated keys keep the last value (enough for our forms). */
export function formDataToObject(form: HTMLFormElement): Record<string, FormDataEntryValue> {
  return Object.fromEntries(new FormData(form));
}

/** Writes field errors next to each input: <p class="error" data-error-for="email">. */
export function showFieldErrors(form: HTMLFormElement, errors: Partial<Record<string, string>>): void {
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((slot) => {
    const message = errors[slot.dataset.errorFor ?? ''];
    slot.textContent = message ?? '';
    slot.hidden = !message;
  });
}
