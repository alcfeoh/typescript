/**
 * T2 — Playwright (20 min) : la page de connexion, src/account/login-page.ts
 *
 * Une fois, avant la session :          npx playwright install chromium
 * Lancer :                              npm run ex T2       (démarre le serveur de dev Vite tout seul)
 * Voir les tests s'exécuter :           npm run e2e:ui
 * Enregistrer un test en cliquant :     npx playwright codegen http://localhost:5173/#/login
 *
 * Les deux premiers tests sont la démo. Transformez ensuite chaque `test.fixme` en vrai test.
 */
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/login');
});

test('logs in with the demo account', async ({ page }) => {
  await page.getByLabel('Email').fill('demo@pxo.fr');
  await page.getByLabel('Password').fill('correct-horse-battery-staple');
  await page.getByRole('button', { name: 'Log in' }).click();

  // Assertion « web-first » : réessayée jusqu'à ce qu'elle passe ou expire (5 s). Aucune attente manuelle.
  await expect(page.getByRole('status')).toHaveText('Welcome back, Demo!');
});

test('shows a message when the server fails (network mocked)', async ({ page }) => {
  // page.route intercepte la requête du navigateur : pas besoin de modifier le serveur pour tester un cas d'erreur.
  await page.route('**/api/login', (route) => route.fulfill({ status: 500, json: { error: 'boom' } }));

  await page.getByLabel('Email').fill('demo@pxo.fr');
  await page.getByLabel('Password').fill('whatever');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('alert')).toHaveText('Server unavailable, please retry.');
});

test.fixme('T2.a — an invalid e-mail shows an error and sends NO request', async () => {
  // Indice : comptez les appels dans un handler page.route('**/api/login', …), ou utilisez page.on('request', …).
});

test.fixme('T2.b — a wrong password shows "Invalid email or password"', async () => {
  // Indice : le faux back-end répond 401 à tout sauf aux identifiants de démo.
});

test.fixme('T2.c — the button is disabled while the request is pending', async () => {
  // Indice : dans page.route, ne répondez pas avant que votre assertion ait tourné (attendez une promesse que vous résolvez plus tard),
  // puis appelez route.continue().
});
