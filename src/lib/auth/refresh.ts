import { API_BASE_URL } from '@/lib/api/config';
import type { Envelope } from '@/types/api';
import type { LoginResponse } from '@/types/auth';
import { setSession } from './session';

let inflight: Promise<string | null> | null = null;

/**
 * Gọi `POST /auth/refresh-token` — MỘT promise dùng chung.
 *
 * Ba request cùng gặp 401 mà gọi refresh ba lần thì server xoay thẻ ba lần;
 * hai lần sau bị coi là dùng lại thẻ cũ và HUỶ CẢ PHIÊN. Gom về một promise:
 * ai đến sau chờ kết quả của người đến trước.
 *
 * Không đi qua `apiFetch` để không rơi vào vòng lặp refresh-của-refresh.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!inflight) {
    inflight = doRefresh().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

async function doRefresh(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) return null;
    const envelope = (await response.json()) as Envelope<LoginResponse>;
    if (!envelope.data) return null;
    setSession(envelope.data.access_token, envelope.data.user);
    return envelope.data.access_token;
  } catch {
    return null;
  }
}
