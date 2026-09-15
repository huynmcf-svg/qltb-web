import type { CursorPage } from '@/types/api';
import type { DeviceExchange, ExchangeStatus } from '@/types/exchange';
import { apiFetch } from './client';
import { q } from './query';

export const exchangesApi = {
  list: (query: { limit?: number; cursor?: string; status?: ExchangeStatus; enterprise_id?: string } = {}, signal?: AbortSignal) => apiFetch<CursorPage<DeviceExchange>>('/device-exchanges', { query: q(query), signal }),
  get: (id: string, signal?: AbortSignal) => apiFetch<DeviceExchange>(`/device-exchanges/${id}`, { signal }),
  create: (input: { old_device_id: string; reason: string }, idempotencyKey: string) => apiFetch<DeviceExchange>('/device-exchanges', { method: 'POST', body: input, idempotencyKey }),
  update: (id: string, input: { reason?: string; notes?: string }) => apiFetch<DeviceExchange>(`/device-exchanges/${id}`, { method: 'PUT', body: input }),
  approve: (id: string, new_device_id: string, note?: string) => apiFetch<DeviceExchange & { api_key: string | null }>(`/device-exchanges/${id}/approve`, { method: 'PUT', body: { new_device_id, note } }),
  reject: (id: string, reject_reason: string) => apiFetch<DeviceExchange>(`/device-exchanges/${id}/reject`, { method: 'PUT', body: { reject_reason } }),
  delete: (id: string) => apiFetch<null>(`/device-exchanges/${id}`, { method: 'DELETE' }),
};
