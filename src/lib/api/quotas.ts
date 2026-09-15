import type { CursorPage } from '@/types/api';
import type { AllocateInput, ListQuotasQuery, ListUsageQuery, QuotaAllocation, QuotaGrant, QuotaRow, UsageLog } from '@/types/quota';
import { apiFetch } from './client';
import { q } from './query';

export const quotasApi = {
  list: (query: ListQuotasQuery = {}, signal?: AbortSignal) => apiFetch<CursorPage<QuotaRow>>('/quotas', { query: q(query), signal }),
  get: (device_id: string, signal?: AbortSignal) => apiFetch<QuotaRow>(`/quotas/${device_id}`, { signal }),
  update: (device_id: string, input: { warn_threshold_pct?: number; package_start_at?: string; package_end_at?: string }) => apiFetch<QuotaRow>(`/quotas/${device_id}`, { method: 'PUT', body: input }),
  grant: (device_id: string, input: { amount: number; note?: string }, idempotencyKey: string) => apiFetch<QuotaRow>(`/quotas/${device_id}/grants`, { method: 'POST', body: input, idempotencyKey }),
  grants: (device_id: string, query: { limit?: number; cursor?: string } = {}, signal?: AbortSignal) => apiFetch<CursorPage<QuotaGrant>>(`/quotas/${device_id}/grants`, { query: q(query), signal }),
  lock: (device_id: string, reason: string) => apiFetch<QuotaRow>(`/quotas/${device_id}/lock`, { method: 'PUT', body: { reason } }),
  unlock: (device_id: string) => apiFetch<QuotaRow>(`/quotas/${device_id}/unlock`, { method: 'PUT' }),
  allocate: (input: AllocateInput, idempotencyKey: string) => apiFetch<QuotaAllocation>('/quotas/allocations', { method: 'POST', body: input, idempotencyKey }),
  allocations: (query: { limit?: number; cursor?: string; from_enterprise_id?: string; to_enterprise_id?: string; device_id?: string } = {}, signal?: AbortSignal) => apiFetch<CursorPage<QuotaAllocation>>('/quotas/allocations', { query: q(query), signal }),
  usage: (query: ListUsageQuery = {}, signal?: AbortSignal) => apiFetch<CursorPage<UsageLog>>('/usage-logs', { query: q(query), signal }),
};
