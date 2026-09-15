'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api/alerts';
import { auditApi } from '@/lib/api/audit';
import { newIdempotencyKey } from '@/lib/api/client';
import { dashboardApi } from '@/lib/api/dashboard';
import { exchangesApi } from '@/lib/api/exchanges';
import { warrantiesApi } from '@/lib/api/warranties';
import type { ListAlertsQuery } from '@/types/alert';
import type { ListAuditQuery } from '@/types/audit';
import type { ExchangeStatus } from '@/types/exchange';
import type { ListWarrantiesQuery } from '@/types/warranty';

const infinite = <T extends { next_cursor: string | null }>(key: readonly unknown[], fn: (cursor: string | undefined, signal: AbortSignal) => Promise<T>) => ({
  queryKey: key,
  queryFn: ({ pageParam, signal }: { pageParam: string | null; signal: AbortSignal }) => fn(pageParam ?? undefined, signal),
  initialPageParam: null as string | null,
  getNextPageParam: (last: T) => last.next_cursor,
});

// ── Warranties ──────────────────────────────────────────────
export function useWarranties(query: Omit<ListWarrantiesQuery, 'cursor'> = {}) {
  return useInfiniteQuery(infinite(['warranties', 'list', query], (cursor, signal) => warrantiesApi.list({ ...query, cursor }, signal)));
}
export function useExtendWarranty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; end_date?: string; notes?: string }) => warrantiesApi.update(v.id, { end_date: v.end_date, notes: v.notes }),
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: ['warranties'] }), qc.invalidateQueries({ queryKey: ['devices'] })]),
  });
}

// ── Alerts / notifications ──────────────────────────────────
export function useAlerts(query: Omit<ListAlertsQuery, 'cursor'> = {}) {
  return useInfiniteQuery(infinite(['alerts', 'list', query], (cursor, signal) => alertsApi.list({ ...query, cursor }, signal)));
}
export function useNotifications(unread?: boolean) {
  return useInfiniteQuery(infinite(['notifications', 'list', { unread }], (cursor, signal) => alertsApi.notifications({ cursor, unread }, signal)));
}
/** Chuông: poll 45 giây — không nhanh hơn (docs). */
export function useUnreadCount() {
  return useQuery({ queryKey: ['notifications', 'unread-count'], queryFn: ({ signal }) => alertsApi.unreadCount(signal).then((r) => r.count), refetchInterval: 45_000 });
}
export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => alertsApi.markRead(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
}
export function useReadAll() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => alertsApi.readAll(), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
}
export function useRunScan() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => alertsApi.scan(), onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: ['alerts'] }), qc.invalidateQueries({ queryKey: ['notifications'] }), qc.invalidateQueries({ queryKey: ['dashboard'] })]) });
}

// ── Exchanges ───────────────────────────────────────────────
export function useExchanges(query: { status?: ExchangeStatus; enterprise_id?: string } = {}) {
  return useInfiniteQuery(infinite(['exchanges', 'list', query], (cursor, signal) => exchangesApi.list({ ...query, cursor }, signal)));
}
function useInvalidateExchanges() {
  const qc = useQueryClient();
  return () => Promise.all([qc.invalidateQueries({ queryKey: ['exchanges'] }), qc.invalidateQueries({ queryKey: ['devices'] }), qc.invalidateQueries({ queryKey: ['quotas'] })]);
}
export function useCreateExchange() {
  const invalidate = useInvalidateExchanges();
  const key = newIdempotencyKey();
  return useMutation({ mutationFn: (input: { old_device_id: string; reason: string }) => exchangesApi.create(input, key), onSuccess: invalidate });
}
export function useApproveExchange() {
  const invalidate = useInvalidateExchanges();
  return useMutation({ mutationFn: (v: { id: string; new_device_id: string; note?: string }) => exchangesApi.approve(v.id, v.new_device_id, v.note), onSuccess: invalidate });
}
export function useRejectExchange() {
  const invalidate = useInvalidateExchanges();
  return useMutation({ mutationFn: (v: { id: string; reject_reason: string }) => exchangesApi.reject(v.id, v.reject_reason), onSuccess: invalidate });
}
export function useDeleteExchange() {
  const invalidate = useInvalidateExchanges();
  return useMutation({ mutationFn: (id: string) => exchangesApi.delete(id), onSuccess: invalidate });
}

// ── Dashboard ───────────────────────────────────────────────
export function useAdminDashboard(enabled: boolean) {
  return useQuery({ queryKey: ['dashboard', 'admin'], queryFn: ({ signal }) => dashboardApi.admin(signal), enabled, staleTime: 60_000 });
}
export function useBusinessDashboard() {
  return useQuery({ queryKey: ['dashboard', 'business'], queryFn: ({ signal }) => dashboardApi.business(signal), staleTime: 60_000 });
}
export function useUsageChart(query: Parameters<typeof dashboardApi.usageChart>[0] = {}) {
  return useQuery({ queryKey: ['dashboard', 'usage-chart', query], queryFn: ({ signal }) => dashboardApi.usageChart(query, signal).then((r) => r.points), staleTime: 60_000 });
}
export function useExpiringDevices() {
  return useQuery({ queryKey: ['dashboard', 'expiring'], queryFn: ({ signal }) => dashboardApi.expiring(signal), staleTime: 60_000 });
}

// ── Audit ───────────────────────────────────────────────────
export function useAuditLogs(query: Omit<ListAuditQuery, 'cursor'> = {}) {
  return useInfiniteQuery(infinite(['audit', 'list', query], (cursor, signal) => auditApi.list({ ...query, cursor }, signal)));
}
