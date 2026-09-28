// Solution — A4 payoff: once Session is typed, tsc reports `session.user.name` (it does not exist).
import type { Session } from '@/account/account-types';
import { html, type SafeHtml } from '@/shared/html';

export function welcomeMessage(session: Session): SafeHtml {
  return html`Welcome, ${session.user.displayName}! Your account id is ${session.user.id}.`;
}
