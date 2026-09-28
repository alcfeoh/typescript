// Pre-coded — a tiny hash router: #/login, #/signup, #/chat, #/media, #/premium
import { mountLogin } from '@/account/login-page';
import { mountSignup } from '@/account/signup-page';
import { mountChat } from '@/chat/chat-page';
import { mountMedia } from '@/media/media-page';
import { mountPremium } from '@/premium/premium-page';

type Mount = (root: HTMLElement) => void | (() => void);

const ROUTES = {
  login: mountLogin,
  signup: mountSignup,
  chat: mountChat,
  media: mountMedia,
  premium: mountPremium,
} satisfies Record<string, Mount>;

type Route = keyof typeof ROUTES;

const isRoute = (name: string): name is Route => Object.hasOwn(ROUTES, name);

const root = document.querySelector<HTMLElement>('#app')!;
let cleanup: void | (() => void);

function navigate(): void {
  const name = location.hash.replace(/^#\/?/, '');
  const route: Route = isRoute(name) ? name : 'login';
  cleanup?.();
  document.querySelectorAll('nav a').forEach((link) => {
    link.toggleAttribute('aria-current', link.getAttribute('href') === `#/${route}`);
  });
  cleanup = ROUTES[route](root);
}

window.addEventListener('hashchange', navigate);
navigate();
