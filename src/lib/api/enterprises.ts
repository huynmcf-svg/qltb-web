import type { CursorPage } from '@/types/api';
import type { CreateEnterpriseInput, Enterprise, EnterpriseStatus, ListEnterprisesQuery, UpdateEnterpriseInput } from '@/types/enterprise';
import { apiFetch } from './client';
import { q } from './query';

export const enterprisesApi = {
  list: (query: ListEnterprisesQuery = {}, signal?: AbortSignal) => apiFetch<CursorPage<Enterprise>>('/enterprises', { query: q(query), signal }),
  get: (id: string, signal?: AbortSignal) => apiFetch<Enterprise>(`/enterprises/${id}`, { signal }),
  branches: (id: string, signal?: AbortSignal) => apiFetch<{ items: Enterprise[] }>(`/enterprises/${id}/branches`, { signal }),
  create: (input: CreateEnterpriseInput) => apiFetch<Enterprise>('/enterprises', { method: 'POST', body: input }),
  update: (id: string, input: UpdateEnterpriseInput) => apiFetch<Enterprise>(`/enterprises/${id}`, { method: 'PUT', body: input }),
  changeStatus: (id: string, status: EnterpriseStatus, reason?: string) => apiFetch<Enterprise>(`/enterprises/${id}/status`, { method: 'PUT', body: { status, reason } }),
  delete: (id: string) => apiFetch<null>(`/enterprises/${id}`, { method: 'DELETE' }),
};
