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

let refreshPromise: Promise<boolean> | null = null;
let onKitchenSessionExpired: (() => void) | null = null;

export function setKitchenSessionExpiredHandler(handler: (() => void) | null): void {
  onKitchenSessionExpired = handler;
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = kitchenTokenStore.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${BASE_URL}/partner/auth/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return false;

      const json = (await response.json()) as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
      if (!json?.data?.accessToken) return false;

      kitchenTokenStore.setTokens(json.data.accessToken, json.data.refreshToken ?? refreshToken);
      return true;
    } catch {
      return false;
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
    const refreshed = await refreshAccessToken();
    if (refreshed) return executeRequest<T>(path, options, true);
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
  delete: <T>(path: string, options: RequestOptions = {}) => executeRequest<T>(path, { ...options, method: 'DELETE' }),
};
