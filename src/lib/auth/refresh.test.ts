import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshAccessToken } from './refresh';
import { getAccessToken } from './session';

describe('refreshAccessToken', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('nhiều lời gọi song song chỉ gọi server MỘT lần', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          request_id: 'r',
          data: { access_token: 'tok-1', expires_in: 900, user: { user_id: 'u' } },
          error: null,
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await Promise.all([refreshAccessToken(), refreshAccessToken(), refreshAccessToken()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results).toEqual(['tok-1', 'tok-1', 'tok-1']);
    expect(getAccessToken()).toBe('tok-1');
  });

  it('thất bại thì trả null, không ném', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve(null) }));
    await expect(refreshAccessToken()).resolves.toBeNull();
  });
});
