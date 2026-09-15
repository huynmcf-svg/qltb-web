'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { newIdempotencyKey } from '@/lib/api/client';
import { quotasApi } from '@/lib/api/quotas';
import type { AllocateInput, ListQuotasQuery, ListUsageQuery } from '@/types/quota';

export const quotaKeys = {
  all: ['quotas'] as const,
  list: (query: Omit<ListQuotasQuery, 'cursor'>) => ['quotas', 'list', query] as const,
  detail: (id: string) => ['quotas', 'detail', id] as const,
  grants: (id: string) => ['quotas', 'grants', id] as const,
  allocations: (query: object) => ['quotas', 'allocations', query] as const,
  usage: (query: object) => ['quotas', 'usage', query] as const,
};

const infinite = <T extends { next_cursor: string | null }>(key: readonly unknown[], fn: (cursor: string | undefined, signal: AbortSignal) => Promise<T>) => ({
  queryKey: key,
  queryFn: ({ pageParam, signal }: { pageParam: string | null; signal: AbortSignal }) => fn(pageParam ?? undefined, signal),
  initialPageParam: null as string | null,
  getNextPageParam: (last: T) => last.next_cursor,
});

export function useQuotas(query: Omit<ListQuotasQuery, 'cursor'> = {}) {
  return useInfiniteQuery(infinite(quotaKeys.list(query), (cursor, signal) => quotasApi.list({ ...query, cursor }, signal)));
}
export function useQuota(device_id: string) {
  return useQuery({ queryKey: quotaKeys.detail(device_id), queryFn: ({ signal }) => quotasApi.get(device_id, signal) });
}
export function useQuotaGrants(device_id: string) {
  return useInfiniteQuery(infinite(quotaKeys.grants(device_id), (cursor, signal) => quotasApi.grants(device_id, { cursor }, signal)));
}
export function useAllocations(query: { from_enterprise_id?: string; to_enterprise_id?: string; device_id?: string } = {}) {
  return useInfiniteQuery(infinite(quotaKeys.allocations(query), (cursor, signal) => quotasApi.allocations({ ...query, cursor }, signal)));
}
export function useUsageLogs(query: Omit<ListUsageQuery, 'cursor'> = {}) {
  return useInfiniteQuery(infinite(quotaKeys.usage(query), (cursor, signal) => quotasApi.usage({ ...query, cursor }, signal)));
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => Promise.all([qc.invalidateQueries({ queryKey: quotaKeys.all }), qc.invalidateQueries({ queryKey: ['devices'] }), qc.invalidateQueries({ queryKey: ['dashboard'] }), qc.invalidateQueries({ queryKey: ['alerts'] })]);
}

/** Một key idempotent cho MỘT lần mở form; retry cùng thao tác giữ nguyên key. */
export function useGrantQuota(device_id: string) {
  const invalidate = useInvalidate();
  const key = newIdempotencyKey();
  return useMutation({ mutationFn: (input: { amount: number; note?: string }) => quotasApi.grant(device_id, input, key), onSuccess: invalidate });
}
export function useUpdateQuota(device_id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: Parameters<typeof quotasApi.update>[1]) => quotasApi.update(device_id, input), onSuccess: invalidate });
}
export function useLockQuota() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (v: { device_id: string; reason: string }) => quotasApi.lock(v.device_id, v.reason), onSuccess: invalidate });
}
export function useUnlockQuota() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (device_id: string) => quotasApi.unlock(device_id), onSuccess: invalidate });
}
export function useAllocateQuota() {
  const invalidate = useInvalidate();
  const key = newIdempotencyKey();
  return useMutation({ mutationFn: (input: AllocateInput) => quotasApi.allocate(input, key), onSuccess: invalidate });
}
