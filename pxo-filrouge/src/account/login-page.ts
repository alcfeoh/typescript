// Pre-coded — the login page. It is the target of the Playwright part (T2).
import { ApiError, login } from '@/account/account-api';
import { LoginSchema } from '@/account/account-schema';
import { $, formDataToObject, showFieldErrors } from '@/shared/dom';
import { html, render } from '@/shared/html';

export function mountLogin(root: HTMLElement): void {
  render(
    root,
    html`<form id="login-form" class="card" novalidate>
      <h2>Log in</h2>
      <label>Email <input name="email" type="email" autocomplete="username" /></label>
      <p class="error" data-error-for="email" hidden></p>
      <label>Password <input name="password" type="password" autocomplete="current-password" /></label>
      <p class="error" data-error-for="password" hidden></p>
      <button type="submit">Log in</button>
      <p class="hint">Demo account: demo@pxo.fr / correct-horse-battery-staple</p>
      <p role="alert" class="form-alert"></p>
      <p role="status" class="form-status"></p>
    </form>`,
  );

  const form = $<HTMLFormElement>('#login-form', root);
  const button = $<HTMLButtonElement>('button[type=submit]', form);
  const alert = $('[role=alert]', form);
  const status = $('[role=status]', form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    alert.textContent = '';
    status.textContent = '';

    const parsed = LoginSchema.safeParse(formDataToObject(form));
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
      showFieldErrors(form, errors);
      return; // nothing is sent to the server
    }
    showFieldErrors(form, {});

    button.disabled = true;
    try {
      const session = await login(parsed.data.email, parsed.data.password);
      if (session === null) {
        alert.textContent = 'Invalid email or password';
      } else {
        status.textContent = `Welcome back, ${session.user.displayName}!`;
      }
    } catch (error) {
      alert.textContent = error instanceof ApiError ? error.message : 'Network error';
    } finally {
      button.disabled = false;
    }
  });
}
