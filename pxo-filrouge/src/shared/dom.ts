// Déjà codé — utilitaires DOM.

/**
 * querySelector qui lève une erreur au lieu de renvoyer null.
 * `T` vaut HTMLElement par défaut : `$('#x')` est un HTMLElement, `$<HTMLInputElement>('#email')` un input.
 * (TypeScript ne devine le type d'élément tout seul que pour un nom de balise seul, par ex. `querySelector('video')`.)
 */
export function $<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`No element matches ${selector}`);
  return element;
}

/** FormData → objet simple. Une clé répétée garde sa dernière valeur (suffisant pour nos formulaires). */
export function formDataToObject(form: HTMLFormElement): Record<string, FormDataEntryValue> {
  return Object.fromEntries(new FormData(form));
}

/** Écrit les erreurs sous chaque champ : <p class="error" data-error-for="email">. */
export function showFieldErrors(form: HTMLFormElement, errors: Partial<Record<string, string>>): void {
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((slot) => {
    const message = errors[slot.dataset.errorFor ?? ''];
    slot.textContent = message ?? '';
    slot.hidden = !message;
  });
}
