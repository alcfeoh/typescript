// Solution — T2 (Playwright, login page).
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/login');
});

test('logs in with the demo account', async ({ page }) => {
  await page.getByLabel('Email').fill('demo@pxo.fr');
  await page.getByLabel('Password').fill('correct-horse-battery-staple');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('status')).toHaveText('Welcome back, Demo!');
});

test('shows a message when the server fails (network mocked)', async ({ page }) => {
  await page.route('**/api/login', (route) => route.fulfill({ status: 500, json: { error: 'boom' } }));

  await page.getByLabel('Email').fill('demo@pxo.fr');
  await page.getByLabel('Password').fill('whatever');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('alert')).toHaveText('Server unavailable, please retry.');
});

test('T2.a — an invalid e-mail shows an error and sends NO request', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/login', (route) => {
    calls++;
    return route.continue();
  });

  await page.getByLabel('Email').fill('not-an-email');
  await page.getByLabel('Password').fill('whatever');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByText('Invalid email', { exact: true })).toBeVisible();
  expect(calls).toBe(0);
});

test('T2.b — a wrong password shows "Invalid email or password"', async ({ page }) => {
  await page.getByLabel('Email').fill('demo@pxo.fr');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('alert')).toHaveText('Invalid email or password');
});

test('T2.c — the button is disabled while the request is pending', async ({ page }) => {
  let release!: () => void;
  const released = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/api/login', async (route) => {
    await released;
    await route.continue();
  });

  const button = page.getByRole('button', { name: 'Log in' });
  await page.getByLabel('Email').fill('demo@pxo.fr');
  await page.getByLabel('Password').fill('correct-horse-battery-staple');
  await button.click();

  await expect(button).toBeDisabled();
  release();
  await expect(button).toBeEnabled();
  await expect(page.getByRole('status')).toHaveText('Welcome back, Demo!');
});
