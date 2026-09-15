import type { AdminDashboard, BusinessDashboard, UsagePoint } from '@/types/dashboard';
import type { QuotaRow } from '@/types/quota';
import type { WarrantyRow } from '@/types/warranty';
import { apiFetch } from './client';
import { q } from './query';

export const dashboardApi = {
  admin: (signal?: AbortSignal) => apiFetch<AdminDashboard>('/dashboard/admin', { signal }),
  business: (signal?: AbortSignal) => apiFetch<BusinessDashboard>('/dashboard/business', { signal }),
  usageChart: (query: { from?: string; to?: string; granularity?: 'day' | 'week' | 'month'; enterprise_id?: string; device_id?: string } = {}, signal?: AbortSignal) => apiFetch<{ points: UsagePoint[] }>('/dashboard/usage-chart', { query: q(query), signal }),
  expiring: (signal?: AbortSignal) => apiFetch<{ quota_low: QuotaRow[]; warranty_expiring: WarrantyRow[] }>('/dashboard/expiring-devices', { signal }),
};
