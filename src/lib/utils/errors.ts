import { ApiError, ERROR_CODES } from '@/types/api';

/**
 * Đổi lỗi API thành câu tiếng Việt để hiển thị — MỘT chỗ duy nhất.
 *
 * Rẽ nhánh theo `error.code`, KHÔNG so khớp `error.message`. Gặp mã lạ thì hiện
 * `message` của server — bảng mã còn được bổ sung, web cũ gặp mã mới không được crash.
 */
const MESSAGES: Record<string, string> = {
  [ERROR_CODES.AUTHENTICATION_FAILED]: 'Phiên đăng nhập không hợp lệ.',
  [ERROR_CODES.AUTHORIZATION_FAILED]: 'Bạn không có quyền thực hiện thao tác này.',
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Không tìm thấy dữ liệu.',
  [ERROR_CODES.INVALID_PAYLOAD]: 'Dữ liệu gửi lên không hợp lệ.',
  [ERROR_CODES.DEVICE_CODE_CONFLICT]: 'Mã thiết bị đã tồn tại.',
  [ERROR_CODES.DEVICE_STATE_CONFLICT]:
    'Trạng thái thiết bị vừa thay đổi. Tải lại rồi thao tác lại.',
  [ERROR_CODES.IDEMPOTENCY_KEY_CONFLICT]:
    'Thao tác này đã được gửi với nội dung khác. Tải lại trang rồi thử lại.',
  [ERROR_CODES.RATE_LIMITED]: 'Quá nhiều yêu cầu. Thử lại sau ít phút.',
  [ERROR_CODES.INTERNAL_ERROR]: 'Lỗi hệ thống. Thử lại sau ít phút.',
};

export function describeError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error && error.message ? error.message : 'Không kết nối được tới máy chủ.';
  }

  // Lỗi validate: server trả từng field sai trong `details.violations`.
  const violations = error.details.violations;
  if (Array.isArray(violations) && violations.length > 0) {
    return violations.join('. ');
  }

  // 422 là vi phạm nghiệp vụ — `message` của server đã cụ thể hơn bảng trên.
  if (error.status === 422 && error.message) return error.message;

  return MESSAGES[error.code] ?? error.message;
}
