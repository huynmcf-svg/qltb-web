import { refreshAccessToken } from '@/lib/auth/refresh';
import { clearSession, getAccessToken } from '@/lib/auth/session';
import { ApiError, type Envelope } from '@/types/api';
import { API_BASE_URL } from './config';

/**
 * Wrapper fetch duy nhất của web.
 *
 * MỌI lời gọi API đi qua đây, không `fetch` rải rác trong component
 * (docs/rules/frontend-structure.md). Ba việc gom về một chỗ:
 *
 *   1. Dựng URL + query, gửi cookie (`credentials: 'include'`)
 *   2. Gắn `Authorization: Bearer <access token>`
 *   3. Gặp 401 thì refresh MỘT LẦN rồi thử lại đúng một lần
 *   4. Bóc envelope, ném `ApiError` mang `error.code`
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /**
   * Cho POST có side effect (khi backend bật idempotency). Sinh MỘT key cho
   * MỘT lần bấm và giữ nguyên khi retry cùng thao tác đó.
   */
  idempotencyKey?: string;
  signal?: AbortSignal;
  /** Bỏ qua bước refresh khi gặp 401. Dùng cho chính /auth/login và /auth/refresh-token. */
  skipRefresh?: boolean;
  query?: Record<string, string | number | undefined | null>;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options.query);
  const response = await sendWithRetry(url, options);

  // 204 không có body.
  if (response.status === 204) return null as T;

  const envelope = (await response.json().catch(() => null)) as Envelope<T> | null;

  if (!envelope) {
    throw new ApiError('INTERNAL_ERROR', 'Máy chủ trả về dữ liệu không đọc được', response.status);
  }

  // Đọc `error` TRƯỚC `data` — thứ tự này là hợp đồng, không phải sở thích.
  if (envelope.error) {
    throw new ApiError(
      envelope.error.code,
      envelope.error.message,
      response.status,
      envelope.error.details ?? {},
      envelope.request_id,
    );
  }

  if (!response.ok) {
    throw new ApiError('INTERNAL_ERROR', 'Lỗi không xác định', response.status);
  }

  return envelope.data as T;
}

async function sendWithRetry(url: string, options: RequestOptions): Promise<Response> {
  const first = await send(url, options);
  if (first.status !== 401 || options.skipRefresh) return first;

  /*
   * Gặp 401 → refresh → thử lại ĐÚNG MỘT LẦN. Không có vòng lặp: nếu request
   * thứ hai vẫn 401 thì vấn đề không phải access token hết hạn.
   */
  const token = await refreshAccessToken();
  if (!token) {
    clearSession();
    return first;
  }
  return send(url, options, token);
}

async function send(url: string, options: RequestOptions, overrideToken?: string): Promise<Response> {
  const token = overrideToken ?? getAccessToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json; charset=utf-8';
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;

  try {
    return await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      credentials: 'include',
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('NETWORK_ERROR', 'Không kết nối được tới máy chủ', 0);
  }
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/** Một lần bấm sinh một key. Giữ nguyên key khi người dùng bấm "thử lại". */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}
