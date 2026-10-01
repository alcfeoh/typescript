import { statSync } from 'node:fs';
import { join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import ts from 'typescript';
import type { Connect, Plugin } from 'vite';
import { root } from './overrides.ts';

/**
 * `@/x` → solutions/x.ts (en mode solution, s'il existe) → src/x.ts.
 * La même règle est déclarée pour tsc dans solutions/tsconfig.json (`paths`).
 */
export function exerciseResolver(solution: boolean): Plugin {
  const folders = solution ? ['solutions', 'src'] : ['src'];
  return {
    name: 'pxo:exercise-resolver',
    enforce: 'pre',
    resolveId(source) {
      if (!source.startsWith('@/')) return null;
      const bare = source.slice(2);
      for (const folder of folders) {
        for (const candidate of [bare, `${bare}.ts`]) {
          const file = join(root, folder, candidate);
          if (statSync(file, { throwIfNoEntry: false })?.isFile()) return file;
        }
      }
      return null;
    },
  };
}

/**
 * Vite 8 compile le TypeScript avec Oxc, qui ne sait transformer que les décorateurs *legacy*
 * (experimentalDecorators). Les décorateurs standards TC39 du Cas 3 ne sont pas encore pris en charge
 * par Node ni par les navigateurs : on les fait donc transformer par TypeScript, fichier par fichier, avant Oxc.
 */
export function standardDecorators(): Plugin {
  return {
    name: 'pxo:standard-decorators',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.ts') || id.includes('node_modules') || !/^\s*@[a-zA-Z]/m.test(code)) {
        return null;
      }
      const out = ts.transpileModule(code, {
        fileName: id,
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
          sourceMap: true,
        },
      });
      return { code: out.outputText, map: out.sourceMapText };
    },
  };
}

// ---------------------------------------------------------------------------
// Faux back-end, servi par le serveur de dev Vite lui-même : POST /api/login, /api/signup, /api/avatar
// ---------------------------------------------------------------------------

const DEMO_USER = {
  id: 'usr_demo',
  email: 'demo@pxo.fr',
  displayName: 'Demo',
  password: 'correct-horse-battery-staple',
};

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

function send(res: ServerResponse, status: number, body: unknown, delayMs = 300): void {
  setTimeout(() => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  }, delayMs);
}

const fakeApi: Connect.NextHandleFunction = async (req, res, next) => {
  if (req.method !== 'POST' || !req.url?.startsWith('/api/')) return next();
  const body = await readBody(req);

  switch (req.url) {
    case '/api/login': {
      const { email, password } = JSON.parse(body.toString() || '{}');
      if (email === DEMO_USER.email && password === DEMO_USER.password) {
        const { password: _, ...user } = DEMO_USER;
        return send(res, 200, { user, token: 'tok_demo' });
      }
      return send(res, 401, { error: 'Invalid credentials' });
    }
    case '/api/signup': {
      const data = JSON.parse(body.toString() || '{}');
      if (String(data.email).toLowerCase() === DEMO_USER.email) {
        return send(res, 409, { error: 'Email already registered' });
      }
      const user = {
        id: `usr_${Math.random().toString(36).slice(2, 8)}`,
        email: data.email,
        displayName: data.displayName,
      };
      return send(res, 201, { user, token: `tok_${user.id}` });
    }
    case '/api/avatar':
      // Le corps multipart est lu puis ignoré : seul le côté client nous intéresse.
      return send(res, 200, { url: '/media/poster-2.jpg', bytes: body.length }, 800);
    default:
      return send(res, 404, { error: 'Not found' });
  }
};

export function fakeBackend(): Plugin {
  return {
    name: 'pxo:fake-backend',
    configureServer(server) {
      server.middlewares.use(fakeApi);
    },
    configurePreviewServer(server) {
      server.middlewares.use(fakeApi);
    },
  };
}
