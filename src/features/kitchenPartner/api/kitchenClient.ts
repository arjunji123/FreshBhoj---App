import Config from 'react-native-config';
import { kitchenTokenStore } from './kitchenTokenStore';
import type { ApiEnvelope } from '@api/types';

/** Same backend as the customer app — only the route prefix (`/partner/**`) differs. */
const BASE_URL =
  Config.API_BASE_URL && Config.API_BASE_URL !== 'YOUR_API_BASE_URL_HERE'
    ? Config.API_BASE_URL.replace(/\/$/, '')
    : 'http://10.0.2.2:3000/api/v1';

const DEFAULT_TIMEOUT_MS = 20_000;

export class KitchenApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly payload?: any;

  constructor(message: string, statusCode: number, payload?: any) {
    super(message);
    this.name = 'KitchenApiError';
    this.statusCode = statusCode;
    this.payload = payload;
    this.code = payload?.code;
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, unknown>;
  skipAuth?: boolean;
  timeoutMs?: number;
}

function buildQueryString(query?: Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined && entry !== null && entry !== '') params.append(key, String(entry));
      });
      return;
    }
    params.append(key, String(value));
  });
  const serialised = params.toString();
  return serialised ? `?${serialised}` : '';
}

/**
 * `ok`        — new tokens stored, retry the request.
 * `rejected`  — the server said the refresh token is no good (or there is none):
 *               the session is genuinely over.
 * `unreachable` — network failure / 5xx: say nothing about the session, so the
 *               caller must NOT sign the partner out over a flaky connection.
 */
type RefreshOutcome = 'ok' | 'rejected' | 'unreachable';

let refreshPromise: Promise<RefreshOutcome> | null = null;
let onKitchenSessionExpired: (() => void) | null = null;

export function setKitchenSessionExpiredHandler(handler: (() => void) | null): void {
  onKitchenSessionExpired = handler;
}

async function refreshAccessToken(): Promise<RefreshOutcome> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async (): Promise<RefreshOutcome> => {
    const refreshToken = kitchenTokenStore.getRefreshToken();
    if (!refreshToken) return 'rejected';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch(`${BASE_URL}/partner/auth/token/refresh`, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } finally {
        clearTimeout(timeout);
      }
      if (response.status >= 500) return 'unreachable';
      if (!response.ok) return 'rejected';

      const json = (await response.json()) as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
      if (!json?.data?.accessToken) return 'rejected';

      kitchenTokenStore.setTokens(json.data.accessToken, json.data.refreshToken ?? refreshToken);
      return 'ok';
    } catch {
      return 'unreachable';
    } finally {
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    }
  })();

  return refreshPromise;
}

async function executeRequest<T>(path: string, options: RequestOptions, isRetry = false): Promise<T> {
  const { body, query, skipAuth, timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...rest } = options;

  const isFormData = body instanceof FormData;
  const accessToken = skipAuth ? null : kitchenTokenStore.getAccessToken();

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
    throw new KitchenApiError(
      error?.name === 'AbortError'
        ? 'That took too long. Check your connection and try again.'
        : 'No internet connection. Please try again.',
      0,
    );
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  const json = text ? safeParse(text) : null;

  if (response.ok) {
    return (json?.data ?? json) as T;
  }

  if (response.status === 401 && !skipAuth && !isRetry) {
    const outcome = await refreshAccessToken();
    if (outcome === 'ok') return executeRequest<T>(path, options, true);
    if (outcome === 'unreachable') {
      throw new KitchenApiError('No internet connection. Please try again.', 0);
    }
    if (accessToken) {
      kitchenTokenStore.clear();
      onKitchenSessionExpired?.();
    }
  }

  throw new KitchenApiError(json?.message ?? `Something went wrong (${response.status})`, response.status, json);
}

function safeParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export const kitchenClient = {
  get: <T>(path: string, options: RequestOptions = {}) => executeRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    executeRequest<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    executeRequest<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    executeRequest<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options: RequestOptions = {}) => executeRequest<T>(path, { ...options, method: 'DELETE' }),
};
