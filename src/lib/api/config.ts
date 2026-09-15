/**
 * Biến `NEXT_PUBLIC_*` bị nhúng vào bundle LÚC BUILD, không đọc được lúc chạy.
 * Đọc qua đây, không `process.env` rải rác.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3400/api/v1';

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'QLTB';
