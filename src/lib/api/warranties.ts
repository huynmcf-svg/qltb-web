import type { CursorPage } from '@/types/api';
import type { ListWarrantiesQuery, WarrantyRow } from '@/types/warranty';
import { apiFetch } from './client';
import { q } from './query';

export const warrantiesApi = {
  list: (query: ListWarrantiesQuery = {}, signal?: AbortSignal) => apiFetch<CursorPage<WarrantyRow>>('/warranties', { query: q(query), signal }),
  expiring: (days: number, signal?: AbortSignal) => apiFetch<CursorPage<WarrantyRow>>('/warranties/expiring', { query: { days }, signal }),
  get: (id: string, signal?: AbortSignal) => apiFetch<WarrantyRow>(`/warranties/${id}`, { signal }),
  create: (input: { device_id: string; start_date: string; end_date: string; source?: string; notes?: string }) => apiFetch<WarrantyRow>('/warranties', { method: 'POST', body: input }),
  update: (id: string, input: { end_date?: string; notes?: string }) => apiFetch<WarrantyRow>(`/warranties/${id}`, { method: 'PUT', body: input }),
};
