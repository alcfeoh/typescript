// Solution — M5 (optional): what only a real browser can check.
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/media');
});

test('the browser picks the AVIF poster', async ({ page }) => {
  const poster = page.locator('.media-card img').first();
  // currentSrc is the URL the browser actually chose among <source> and <img>.
  await expect.poll(() => poster.evaluate((img: HTMLImageElement) => img.currentSrc)).toMatch(/\.avif$/);
});

test('hovering a card plays its preview muted, leaving stops and rewinds it', async ({ page }) => {
  const card = page.locator('.media-card').first();
  const video = card.locator('video.preview');

  await card.hover();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.muted)).toBe(true);

  await page.mouse.move(0, 0);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused && v.currentTime === 0)).toBe(true);
});

test('the player keeps the volume within [0, 1] and shows the comments', async ({ page }) => {
  await page.locator('.media-card').first().click();
  await expect(page.getByText('5 comments')).toBeVisible();

  await page.getByRole('button', { name: 'Volume up' }).click();
  await expect(page.locator('#volume')).toHaveText('Volume 100 %');

  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#volume')).toHaveText('Volume 90 %');
});

test('invalid comment data is reported, not rendered', async ({ page }) => {
  await page.locator('.media-card').nth(1).click();
  await expect(page.getByText('These comments could not be loaded (invalid data).')).toBeVisible();
});
