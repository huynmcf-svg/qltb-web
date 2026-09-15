/**
 * Chuỗi API nhúng vào bundle trình duyệt. Không đọc `process.env.VERCEL` ở
 * đây — biến đó không vào client, check sẽ luôn ra false.
 *
 * `http://` tới host thật (không phải localhost) đổi sang `https://` để tránh
 * Mixed Content khi web chạy HTTPS.
 */
export function normalizePublicApiBaseUrl(raw: string | undefined): string {
  const base = raw ?? 'http://localhost:3400/api/v1';
  const isLocal = /localhost|127\.0\.0\.1/.test(base);
  if (base.startsWith('http://') && !isLocal) {
    return `https://${base.slice('http://'.length)}`;
  }
  return base;
}
