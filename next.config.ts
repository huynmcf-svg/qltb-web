import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

/** Origin của API để khai `connect-src`. Dev gọi thẳng service ở cổng khác. */
function apiOrigin(): string | null {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3400/api/v1';
  try {
    return new URL(base).origin;
  } catch {
    return null; // đường dẫn tương đối → cùng origin
  }
}

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` cho script là điều KHÔNG muốn nhưng phải chịu: Next nhúng
 * dữ liệu hydration bằng inline script. Phần còn lại vẫn chặt: không nạp
 * script/font/ảnh từ host lạ, không nhúng được vào iframe. Dev cần thêm
 * `'unsafe-eval'` cho HMR.
 */
function contentSecurityPolicy(): string {
  const api = apiOrigin();
  const connect = ["'self'", api].filter(Boolean).join(' ');
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connect}`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy() },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(isProd
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
    : []),
];

const nextConfig: NextConfig = {
  // standalone: gói sẵn node_modules cần thiết để image runtime nhỏ gọn.
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
