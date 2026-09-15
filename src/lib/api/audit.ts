import type { CursorPage } from '@/types/api';
import type { AuditLog, ListAuditQuery } from '@/types/audit';
import { apiFetch } from './client';
import { q } from './query';

export const auditApi = {
  list: (query: ListAuditQuery = {}, signal?: AbortSignal) => apiFetch<CursorPage<AuditLog>>('/audit-logs', { query: q(query), signal }),
  get: (id: string, signal?: AbortSignal) => apiFetch<AuditLog>(`/audit-logs/${id}`, { signal }),
};
