/**
 * M5 (optionnel, fin du Cas 3) — Ce que seul un vrai navigateur peut vérifier.
 * Les tests unitaires (happy-dom) prouvent le HTML ; ils ne peuvent pas prouver que le navigateur choisit l'AVIF,
 * ni que l'aperçu joue vraiment. Lancer : npm run ex M5
 */
import { test } from '@playwright/test';

test.fixme('the browser picks the AVIF poster', async () => {
  // Indice : img.currentSrc est l'URL choisie par le navigateur. Lisez-la avec locator.evaluate(),
  // dans un expect.poll() — l'image n'est peut-être pas encore chargée.
});

test.fixme('hovering a card plays its preview muted; leaving pauses and rewinds it', async () => {
  // Indice : locator.hover(), page.mouse.move(0, 0), et video.paused / video.muted / video.currentTime.
});
