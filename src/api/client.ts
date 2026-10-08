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
type RefreshResult = 'ok' | 'rejected' | 'unavailable';
let refreshPromise: Promise<RefreshResult> | null = null;

/** Set by the auth store so a dead session can bounce the user to Login. */
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

/**
 * `rejected` means the server told us the refresh token is dead (sign the user
 * out). `unavailable` means we could not find out — offline, timed out or a 5xx
 * — and the session must be kept, otherwise a tunnel or a bad signal would log
 * people out.
 */
async function refreshAccessToken(): Promise<RefreshResult> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async (): Promise<RefreshResult> => {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) return 'rejected';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(`${BASE_URL}/auth/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal,
      });

      if (response.status >= 500) return 'unavailable';
      if (!response.ok) return 'rejected';

      const json = (await response.json()) as ApiEnvelope<{
        accessToken: string;
        refreshToken: string;
      }>;

      if (!json?.data?.accessToken) return 'rejected';

      tokenStore.setTokens(json.data.accessToken, json.data.refreshToken ?? refreshToken);
      return 'ok';
    } catch {
      return 'unavailable';
    } finally {
      clearTimeout(timeout);
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
    if (refreshed === 'ok') {
      return executeRequest<T>(path, options, true);
    }
    // A guest never had a session to expire — only force sign-out when there
    // was an actual access token that just went bad AND the server confirmed
    // the refresh token is dead. Guest-triggered 401s are meant to be caught
    // before they get here (see useRequireAuth), but this keeps a guest from
    // being kicked to the logged-out screen if one slips through.
    if (refreshed === 'rejected' && accessToken) {
      tokenStore.clear();
      onSessionExpired?.();
    }
  }

  throw new ApiError(errorMessage(json, response.status), response.status, json);
}

/**
 * Prefers the specific per-field reasons over the generic "Validation failed"
 * the backend sends alongside them, so an Alert can say what to fix.
 */
function errorMessage(json: any, status: number): string {
  if (Array.isArray(json?.errors) && json.errors.length > 0) {
    return json.errors.slice(0, 2).join('. ');
  }
  if (typeof json?.message === 'string' && json.message) return json.message;
  return status >= 500
    ? 'Something went wrong on our side. Please try again.'
    : `Something went wrong (${status})`;
}

function safeParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    // A gateway error page (HTML) is not something to show a customer.
    return null;
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
