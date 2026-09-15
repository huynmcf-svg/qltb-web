import { getAccessToken } from '@/lib/auth/session';
import { API_BASE_URL } from './config';

/**
 * Báo cáo trả FILE, không envelope — không đi qua `apiFetch`. Tải bằng fetch
 * kèm token rồi mở blob; không dùng `<a href>` trực tiếp vì cần header Bearer.
 */
export async function downloadReport(path: 'devices' | 'quota' | 'enterprises', query: Record<string, string | undefined> = {}): Promise<void> {
  const url = new URL(`${API_BASE_URL}/reports/${path}`, window.location.origin);
  for (const [k, v] of Object.entries(query)) if (v) url.searchParams.set(k, v);
  const token = getAccessToken();
  const res = await fetch(url.toString(), { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: 'include' });
  if (!res.ok) throw new Error(`Xuất báo cáo thất bại (${res.status})`);
  const blob = await res.blob();
  const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') ?? '')?.[1] ?? `${path}.xlsx`;
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  a.click();
  URL.revokeObjectURL(href);
}
