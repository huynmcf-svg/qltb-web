import type { CursorPage } from '@/types/api';
import type { Alert, ListAlertsQuery, Notification } from '@/types/alert';
import { apiFetch } from './client';
import { q } from './query';

export const alertsApi = {
  list: (query: ListAlertsQuery = {}, signal?: AbortSignal) => apiFetch<CursorPage<Alert>>('/alerts', { query: q(query), signal }),
  get: (id: string, signal?: AbortSignal) => apiFetch<Alert>(`/alerts/${id}`, { signal }),
  scan: () => apiFetch<Record<string, number>>('/alerts/scan', { method: 'POST' }),
  notifications: (query: { limit?: number; cursor?: string; unread?: boolean } = {}, signal?: AbortSignal) => apiFetch<CursorPage<Notification>>('/notifications', { query: q(query), signal }),
  unreadCount: (signal?: AbortSignal) => apiFetch<{ count: number }>('/notifications/unread-count', { signal }),
  markRead: (id: string) => apiFetch<null>(`/notifications/${id}/read`, { method: 'PUT' }),
  readAll: () => apiFetch<{ updated: number }>('/notifications/read-all', { method: 'PUT' }),
};
