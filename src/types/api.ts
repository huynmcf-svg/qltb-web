/**
 * Type khớp `qltb-workspace/docs/api-contracts.md`.
 *
 * Giữ nguyên `snake_case` của API. ĐỪNG map sang camelCase — lúc debug người ta
 * so response trong DevTools với type trong code.
 *
 * Đổi hợp đồng thì sửa cả hai repo trong CÙNG một đợt.
 */

export interface Envelope<T> {
  request_id: string;
  data: T | null;
  error: ApiErrorBody | null;
}

export interface ApiErrorBody {
  code: string;
  /** Để NGƯỜI đọc. Rẽ nhánh logic bằng `code`, không bao giờ so khớp chuỗi này. */
  message: string;
  details: Record<string, unknown>;
}

/** Phân trang cursor. `next_cursor` là opaque — không parse, không tự sinh. */
export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
}

/**
 * Bảng mã lỗi — chép đủ từ docs/api-contracts.md. Web gặp mã lạ thì hiển thị
 * `message`, KHÔNG được crash.
 */
export const ERROR_CODES = {
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DEVICE_CODE_CONFLICT: 'DEVICE_CODE_CONFLICT',
  DEVICE_STATE_CONFLICT: 'DEVICE_STATE_CONFLICT',
  IDEMPOTENCY_KEY_CONFLICT: 'IDEMPOTENCY_KEY_CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** Lỗi mang mã của hợp đồng. Mọi lời gọi API ném lớp này khi thất bại. */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly details: Record<string, unknown> = {},
    readonly request_id?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  is(code: ErrorCode): boolean {
    return this.code === code;
  }
}
