import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/types/api';
import { apiFetch } from './client';

function mockFetch(status: number, body: unknown) {
  const response = {
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  } as Response;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
}

describe('apiFetch', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('bóc data khỏi envelope', async () => {
    mockFetch(200, { request_id: 'r1', data: { device_id: 'd1' }, error: null });
    await expect(apiFetch('/devices/d1')).resolves.toEqual({ device_id: 'd1' });
  });

  it('ném ApiError mang code khi envelope có error', async () => {
    mockFetch(404, {
      request_id: 'r1',
      data: null,
      error: { code: 'RESOURCE_NOT_FOUND', message: 'Không tìm thấy thiết bị', details: { id: 'd1' } },
    });
    const error = await apiFetch('/devices/d1').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('RESOURCE_NOT_FOUND');
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).request_id).toBe('r1');
  });

  it('bỏ tham số query rỗng', async () => {
    mockFetch(200, { request_id: 'r1', data: { items: [], next_cursor: null }, error: null });
    await apiFetch('/devices', { query: { q: '', status: 'IN_USE', cursor: undefined } });
    const url = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(url).toContain('status=IN_USE');
    expect(url).not.toContain('q=');
    expect(url).not.toContain('cursor');
  });
});
