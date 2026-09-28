/**
 * M5 (optional, end of Case 3) — What only a real browser can check.
 * The unit tests (happy-dom) prove the markup; they cannot prove that the browser picks AVIF,
 * or that the preview actually plays. Run: npm run e2e -- media
 */
import { test } from '@playwright/test';

test.fixme('the browser picks the AVIF poster', async () => {
  // Hint: img.currentSrc is the URL the browser chose. Read it with locator.evaluate(),
  // inside expect.poll() — the image may not be loaded yet.
});

test.fixme('hovering a card plays its preview muted; leaving pauses and rewinds it', async () => {
  // Hint: locator.hover(), page.mouse.move(0, 0), and video.paused / video.muted / video.currentTime.
});
