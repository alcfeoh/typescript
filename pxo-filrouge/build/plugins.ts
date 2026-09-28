import { statSync } from 'node:fs';
import { join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import ts from 'typescript';
import type { Connect, Plugin } from 'vite';
import { root } from './overrides.ts';

/**
 * `@/x` → solutions/x.ts (solution mode, if it exists) → src/x.ts.
 * The same fallback is declared for tsc in solutions/tsconfig.json (`paths`).
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
 * Vite 8 compiles TypeScript with Oxc, which only lowers *legacy* (experimentalDecorators)
 * decorators. The TC39 standard decorators used in Case 3 are not supported by Node or
 * browsers yet, so we let the TypeScript compiler lower them, file by file, before Oxc runs.
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
// Fake backend, served by the Vite dev server itself: POST /api/login, /api/signup, /api/avatar
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
      // The multipart body is read and ignored: we only care about the client side.
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
