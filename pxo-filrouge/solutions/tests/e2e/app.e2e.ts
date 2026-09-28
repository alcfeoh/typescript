// Solution-only end-to-end checks: the whole app works once every exercise is done.
// Run with `npm run e2e:solution`. M5-media.e2e.ts is also the solution of the optional M5 exercise.
import { expect, test } from '@playwright/test';

test.describe('Case 1 — sign-up & avatar', () => {
  test('creates an account, then uploads an avatar', async ({ page }) => {
    await page.goto('/#/signup');
    await page.getByLabel('Email').fill('  Alice@PXO.fr ');
    await page.getByLabel('Display name').fill('Alice');
    await page.getByLabel('Password', { exact: true }).fill('a-long-enough-password');
    await page.getByLabel('Confirm password').fill('a-long-enough-password');
    await page.getByLabel('Search a country').fill('suis');
    await expect(page.locator('select[name=country] option')).toHaveCount(1);
    await page.getByLabel('I accept the terms of use').check();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('status')).toHaveText(/^Welcome, Alice! Your account id is usr_\w+\.$/);

    await page.getByLabel('Picture').setInputFiles({
      name: 'me.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(1024),
    });
    await page.getByRole('button', { name: 'Upload' }).click();
    await expect(page.getByAltText('Your avatar')).toHaveAttribute('src', '/media/poster-2.jpg');
  });

  test('shows the field errors: terms first, then the passwords', async ({ page }) => {
    await page.goto('/#/signup');
    await page.getByLabel('Email').fill('alice@pxo.fr');
    await page.getByLabel('Display name').fill('Alice');
    await page.getByLabel('Password', { exact: true }).fill('a-long-enough-password');
    await page.getByLabel('Confirm password').fill('something-else-entirely');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText('You must accept the terms')).toBeVisible();

    await page.getByLabel('I accept the terms of use').check();
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('refuses an e-mail that is already registered', async ({ page }) => {
    await page.goto('/#/signup');
    await page.getByLabel('Email').fill('demo@pxo.fr');
    await page.getByLabel('Display name').fill('Demo');
    await page.getByLabel('Password', { exact: true }).fill('a-long-enough-password');
    await page.getByLabel('Confirm password').fill('a-long-enough-password');
    await page.getByLabel('I accept the terms of use').check();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('alert').first()).toHaveText('This email is already registered');
  });
});

test.describe('Case 2 — chat', () => {
  test('receives the welcome message, sends one, gets read, a reaction and a reply', async ({ page }) => {
    await page.goto('/#/chat');
    await expect(page.getByText('Connected to #support')).toBeVisible();
    await expect(page.getByText('Bonjour ! Comment puis-je vous aider ?')).toBeVisible();

    await page.getByLabel('Your message').fill('Hello from Playwright');
    await page.getByRole('button', { name: 'Send' }).click();

    const mine = page.locator('.message.mine', { hasText: 'Hello from Playwright' });
    await expect(mine).toBeVisible();
    await expect(mine.getByText('✓✓ Read')).toBeVisible();
    await expect(mine.getByText('👍 1')).toBeVisible();
    await expect(page.getByText('Merci pour votre message ! Je regarde ça tout de suite.')).toBeVisible();
  });

  test('drops the broken frames without breaking the chat', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning') warnings.push(message.text());
    });
    await page.goto('/#/chat');

    await expect.poll(() => warnings.length).toBe(2);
    await expect(page.getByText('Bonjour ! Comment puis-je vous aider ?')).toBeVisible();
  });
});

test.describe('Bonus — premium', () => {
  test('labels the offers and shows the monthly cost', async ({ page }) => {
    await page.goto('/#/premium');
    await expect(page.getByText(/249,00\s€ once, 5 seats/)).toBeVisible();

    await page.getByLabel(/yearly/).check();
    await expect(page.locator('#per-month')).toHaveText(/≈ 8,25\s€ \/ month/);
  });
});
