// Pre-coded — the sign-up page (Case 1). It uses what you write in A1–A4 and B1.
import { ApiError, signup, uploadAvatar } from '@/account/account-api';
import { SignupSchema, UploadSchema } from '@/account/account-schema';
import type { UploadOptions } from '@/account/account-types';
import { welcomeMessage } from '@/account/welcome';
import { COUNTRIES, flagEmoji, type Country } from '@/shared/countries';
import { $, formDataToObject, showFieldErrors } from '@/shared/dom';
import { validateForm } from '@/shared/form';
import { html, render } from '@/shared/html';
import { searchBy } from '@/shared/search';
import { TodoError } from '@/shared/todo';

function countryOptions(query: string) {
  let countries: readonly Country[] = COUNTRIES;
  try {
    if (query) countries = searchBy(COUNTRIES, 'name', query);
  } catch (error) {
    if (!(error instanceof TodoError)) throw error; // B1 not done: no filtering
  }
  return countries.map((c) => html`<option value="${c.code}">${flagEmoji(c.code)} ${c.name}</option>`);
}

export function mountSignup(root: HTMLElement): void {
  render(
    root,
    html`<form id="signup-form" class="card" novalidate>
        <h2>Create your account</h2>
        <label>Email <input name="email" type="email" autocomplete="email" /></label>
        <p class="error" data-error-for="email" hidden></p>
        <label>Display name <input name="displayName" autocomplete="nickname" /></label>
        <p class="error" data-error-for="displayName" hidden></p>
        <label>Password <input name="password" type="password" autocomplete="new-password" /></label>
        <p class="error" data-error-for="password" hidden></p>
        <label>Confirm password <input name="confirmPassword" type="password" autocomplete="new-password" /></label>
        <p class="error" data-error-for="confirmPassword" hidden></p>
        <label>Search a country <input id="country-search" type="search" placeholder="ex: suis" /></label>
        <label>Country <select name="country">${countryOptions('')}</select></label>
        <p class="error" data-error-for="country" hidden></p>
        <label class="inline"><input name="newsletter" type="checkbox" /> Send me the newsletter</label>
        <label class="inline"><input name="acceptTerms" type="checkbox" /> I accept the terms of use</label>
        <p class="error" data-error-for="acceptTerms" hidden></p>
        <button type="submit">Create account</button>
        <p role="alert" class="form-alert"></p>
        <p role="status" class="form-status"></p>
      </form>

      <form id="avatar-form" class="card" novalidate hidden>
        <h2>Your avatar</h2>
        <label>Picture <input name="avatar" type="file" accept="image/*" /></label>
        <p class="error" data-error-for="avatar" hidden></p>
        <label>Caption <input name="caption" /></label>
        <p class="error" data-error-for="caption" hidden></p>
        <button type="submit">Upload</button>
        <p role="alert" class="form-alert"></p>
        <img class="avatar" alt="Your avatar" hidden />
      </form>`,
  );

  const form = $<HTMLFormElement>('#signup-form', root);
  const search = $<HTMLInputElement>('#country-search', form);
  const select = $<HTMLSelectElement>('select[name=country]', form);
  const alert = $('[role=alert]', form);
  const status = $('[role=status]', form);

  search.addEventListener('input', () => render(select, html`${countryOptions(search.value)}`));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    alert.textContent = '';
    try {
      const result = validateForm(SignupSchema, formDataToObject(form));
      if (!result.ok) {
        showFieldErrors(form, result.errors);
        return;
      }
      showFieldErrors(form, {});
      const session = await signup(result.data);
      if (session === null) {
        alert.textContent = 'This email is already registered';
        return;
      }
      render(status, welcomeMessage(session));
      form.querySelector('button')!.disabled = true;
      mountAvatarForm(root);
    } catch (error) {
      alert.textContent =
        error instanceof TodoError ? `⚠️ ${error.message}` : error instanceof ApiError ? error.message : String(error);
    }
  });
}

function mountAvatarForm(root: HTMLElement): void {
  const form = $<HTMLFormElement>('#avatar-form', root);
  const alert = $('[role=alert]', form);
  const preview = $<HTMLImageElement>('img.avatar', form);
  form.hidden = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    alert.textContent = '';
    const raw = formDataToObject(form);
    // An empty <input type=file> still sends a File, of size 0 and without a name.
    if (raw.avatar instanceof File && raw.avatar.size === 0) delete raw.avatar;
    if (raw.caption === '') delete raw.caption;

    try {
      const result = validateForm(UploadSchema, raw);
      if (!result.ok) {
        showFieldErrors(form, result.errors);
        return;
      }
      showFieldErrors(form, {});
      const options: UploadOptions = { caption: result.data.caption };
      const { url } = await uploadAvatar(result.data.avatar, options);
      preview.src = url;
      preview.hidden = false;
    } catch (error) {
      alert.textContent = error instanceof TodoError ? `⚠️ ${error.message}` : String(error);
    }
  });
}
