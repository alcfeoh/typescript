/**
 * T2 — Playwright (20 min): the login page, src/account/login-page.ts
 *
 * Once, before the session:   npx playwright install chromium
 * Run:                        npm run e2e          (starts the Vite dev server by itself)
 * Watch it run:               npm run e2e:ui
 * Record a test by clicking:  npx playwright codegen http://localhost:5173/#/login
 *
 * The first two tests are the demo. Then turn each `test.fixme` into a real test.
 */
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/login');
});

test('logs in with the demo account', async ({ page }) => {
  await page.getByLabel('Email').fill('demo@pxo.fr');
  await page.getByLabel('Password').fill('correct-horse-battery-staple');
  await page.getByRole('button', { name: 'Log in' }).click();

  // Web-first assertion: retried until it passes or times out (5 s). No manual waits.
  await expect(page.getByRole('status')).toHaveText('Welcome back, Demo!');
});

test('shows a message when the server fails (network mocked)', async ({ page }) => {
  // page.route intercepts the browser's request: no server change needed to test an error path.
  await page.route('**/api/login', (route) => route.fulfill({ status: 500, json: { error: 'boom' } }));

  await page.getByLabel('Email').fill('demo@pxo.fr');
  await page.getByLabel('Password').fill('whatever');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('alert')).toHaveText('Server unavailable, please retry.');
});

test.fixme('T2.a — an invalid e-mail shows an error and sends NO request', async () => {
  // Hint: count the calls in a page.route('**/api/login', …) handler, or use page.on('request', …).
});

test.fixme('T2.b — a wrong password shows "Invalid email or password"', async () => {
  // Hint: the fake back-end answers 401 to anything but the demo credentials.
});

test.fixme('T2.c — the button is disabled while the request is pending', async () => {
  // Hint: in page.route, do not answer until your assertion has run (await a promise you resolve later),
  // then call route.continue().
});
