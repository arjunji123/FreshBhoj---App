import Config from 'react-native-config';
import { tokenStore } from './tokenStore';
import type { ApiEnvelope } from './types';

/**
 * `API_BASE_URL` comes from the flavour-specific .env file consumed by
 * react-native-config. The localhost fallback keeps a fresh clone runnable:
 * 10.0.2.2 is how the Android emulator reaches the host machine.
 */
const BASE_URL =
  Config.API_BASE_URL && Config.API_BASE_URL !== 'YOUR_API_BASE_URL_HERE'
    ? Config.API_BASE_URL.replace(/\/$/, '')
    : 'http://10.0.2.2:3000/api/v1';

const DEFAULT_TIMEOUT_MS = 20_000;

/** Normalised failure the whole app can render without re-parsing responses. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly errors?: string[];
  readonly payload?: any;

  constructor(message: string, statusCode: number, payload?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.payload = payload;
    this.code = payload?.code;
    this.errors = Array.isArray(payload?.errors) ? payload.errors : undefined;
  }

  /** True when the device is offline or the request timed out. */
  get isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  /** The cart's "items from another kitchen" conflict. */
  get isKitchenConflict(): boolean {
    return this.statusCode === 409 && this.code === 'CART_KITCHEN_CONFLICT';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, unknown>;
  /** Skips the Authorization header — used by the token-refresh call itself. */
  skipAuth?: boolean;
  timeoutMs?: number;
}

/** Serialises query params, repeating the key for arrays (`?goalTags=A&goalTags=B`). */
function buildQueryString(query?: Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined && entry !== null && entry !== '') {
          params.append(key, String(entry));
        }
      });
      return;
    }
    params.append(key, String(value));
  });

  const serialised = params.toString();
  return serialised ? `?${serialised}` : '';
}

// ── Refresh coordination ────────────────────────────────────────────────────
// Several queries can 401 at the same moment (Home fires five in parallel).
// Without this, each would kick off its own refresh and the rotating refresh
// token would invalidate the others. One in-flight refresh, shared by all.
let refreshPromise: Promise<boolean> | null = null;

/** Set by the auth store so a dead session can bounce the user to Login. */
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${BASE_URL}/auth/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const json = (await response.json()) as ApiEnvelope<{
        accessToken: string;
        refreshToken: string;
      }>;

      if (!json?.data?.accessToken) return false;

      tokenStore.setTokens(json.data.accessToken, json.data.refreshToken ?? refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      // Cleared on the next tick so concurrent callers all read the same result.
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    }
  })();

  return refreshPromise;
}

async function executeRequest<T>(
  path: string,
  options: RequestOptions,
  isRetry = false,
): Promise<T> {
  const { body, query, skipAuth, timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...rest } = options;

  const isFormData = body instanceof FormData;
  const accessToken = skipAuth ? null : tokenStore.getAccessToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}${buildQueryString(query)}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  } catch (error: any) {
    throw new ApiError(
      error?.name === 'AbortError'
        ? 'That took too long. Check your connection and try again.'
        : 'No internet connection. Please try again.',
      0,
    );
  } finally {
    clearTimeout(timeout);
  }

  // 204 and other empty bodies have nothing to parse.
  const text = await response.text();
  const json = text ? safeParse(text) : null;

  if (response.ok) {
    return (json?.data ?? json) as T;
  }

  if (response.status === 401 && !skipAuth && !isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return executeRequest<T>(path, options, true);
    }
    tokenStore.clear();
    onSessionExpired?.();
  }

  throw new ApiError(
    json?.message ?? `Something went wrong (${response.status})`,
    response.status,
    json,
  );
}

function safeParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/** Thin, typed wrapper around fetch. Every network call in the app goes here. */
export const apiClient = {
  get: <T>(path: string, options: RequestOptions = {}) =>
    executeRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    executeRequest<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    executeRequest<T>(path, { ...options, method: 'PATCH', body }),

  put: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    executeRequest<T>(path, { ...options, method: 'PUT', body }),

  delete: <T>(path: string, options: RequestOptions = {}) =>
    executeRequest<T>(path, { ...options, method: 'DELETE' }),

  baseUrl: BASE_URL,
};
