import { describe, expect, it } from 'vitest';
import { normalizePublicApiBaseUrl } from './public-url';

describe('normalizePublicApiBaseUrl', () => {
  it('giữ http lúc local', () => {
    expect(normalizePublicApiBaseUrl('http://localhost:3400/api/v1')).toBe(
      'http://localhost:3400/api/v1',
    );
  });

  it('đổi http → https với host Vercel', () => {
    expect(normalizePublicApiBaseUrl('http://qltb-service.vercel.app/api/v1')).toBe(
      'https://qltb-service.vercel.app/api/v1',
    );
  });

  it('thiếu biến thì fallback localhost (chỉ dành cho dev)', () => {
    expect(normalizePublicApiBaseUrl(undefined)).toBe('http://localhost:3400/api/v1');
  });
});
