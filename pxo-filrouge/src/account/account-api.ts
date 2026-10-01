// Déjà codé — faites comme si ce fichier était généré à partir de la spécification OpenAPI du back-end :
// vous ne pouvez pas le modifier, et il n'exporte PAS les types de ses réponses.
// L'étape A4 dérive les types dont vous avez besoin à partir des signatures des fonctions.
import type { SignupData } from '@/account/account-schema';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message = 'Server unavailable, please retry.',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Renvoie null quand les identifiants sont faux (HTTP 401). */
export async function login(
  email: string,
  password: string,
): Promise<{ user: { id: `usr_${string}`; email: string; displayName: string }; token: string } | null> {
  const response = await postJson('/api/login', { email, password });
  if (response.status === 401) return null;
  if (!response.ok) throw new ApiError(response.status);
  return response.json();
}

/** Renvoie null quand l'e-mail est déjà enregistré (HTTP 409). */
export async function signup(
  data: SignupData,
): Promise<{ user: { id: `usr_${string}`; email: string; displayName: string }; token: string } | null> {
  const response = await postJson('/api/signup', data);
  if (response.status === 409) return null;
  if (!response.ok) throw new ApiError(response.status);
  return response.json();
}

export async function uploadAvatar(
  file: File,
  options?: { caption?: string; signal?: AbortSignal },
): Promise<{ url: string; bytes: number }> {
  const body = new FormData();
  body.append('avatar', file);
  if (options?.caption) body.append('caption', options.caption);
  const response = await fetch('/api/avatar', { method: 'POST', body, signal: options?.signal });
  if (!response.ok) throw new ApiError(response.status);
  return response.json();
}
