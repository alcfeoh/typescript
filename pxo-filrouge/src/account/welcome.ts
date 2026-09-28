// Pre-coded… with a bug that only TypeScript can find, once Session is no longer `any` (A4).
import type { Session } from '@/account/account-types';
import { html, type SafeHtml } from '@/shared/html';

export function welcomeMessage(session: Session): SafeHtml {
  return html`Welcome, ${session.user.name}! Your account id is ${session.user.id}.`;
}
