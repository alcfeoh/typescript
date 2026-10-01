// Solution — ce qu'apporte A4 : une fois Session typé, tsc signale `session.user.name` (qui n'existe pas).
import type { Session } from '@/account/account-types';
import { html, type SafeHtml } from '@/shared/html';

export function welcomeMessage(session: Session): SafeHtml {
  return html`Welcome, ${session.user.displayName}! Your account id is ${session.user.id}.`;
}
