// Déjà codé… avec un bug que seul TypeScript peut trouver, une fois que Session ne vaut plus `any` (A4).
import type { Session } from '@/account/account-types';
import { html, type SafeHtml } from '@/shared/html';

export function welcomeMessage(session: Session): SafeHtml {
  return html`Welcome, ${session.user.name}! Your account id is ${session.user.id}.`;
}
