// Pre-coded — pretend this file is generated from the back-end's OpenAPI spec:
// you may not edit it, and it does NOT export its response types.
// Step A4 derives the types you need from the function signatures instead.
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

/** Resolves to null when the credentials are wrong (HTTP 401). */
export async function login(
  email: string,
  password: string,
): Promise<{ user: { id: `usr_${string}`; email: string; displayName: string }; token: string } | null> {
  const response = await postJson('/api/login', { email, password });
  if (response.status === 401) return null;
  if (!response.ok) throw new ApiError(response.status);
  return response.json();
}

/** Resolves to null when the e-mail is already registered (HTTP 409). */
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
