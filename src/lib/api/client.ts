import { ApiError, type Envelope } from '@/types/api';
import { API_BASE_URL } from './config';

/**
 * Wrapper fetch duy nhất của web.
 *
 * MỌI lời gọi API đi qua đây, không `fetch` rải rác trong component
 * (docs/rules/frontend-structure.md). Ba việc gom về một chỗ:
 *
 *   1. Dựng URL + query, gửi cookie (`credentials: 'include'`)
 *   2. Bóc envelope, ném `ApiError` mang `error.code`
 *   3. Chỗ duy nhất gắn `Authorization` / refresh khi có auth
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
  query?: Record<string, string | number | undefined | null>;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options.query);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json; charset=utf-8';
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;

  let response: Response;
  try {
    response = await fetch(url, {
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
