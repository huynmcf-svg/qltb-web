'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enterprisesApi } from '@/lib/api/enterprises';
import type { CreateEnterpriseInput, EnterpriseStatus, ListEnterprisesQuery, UpdateEnterpriseInput } from '@/types/enterprise';

export const enterpriseKeys = {
  all: ['enterprises'] as const,
  list: (query: Omit<ListEnterprisesQuery, 'cursor'>) => ['enterprises', 'list', query] as const,
  detail: (id: string) => ['enterprises', 'detail', id] as const,
  branches: (id: string) => ['enterprises', 'branches', id] as const,
};

export function useEnterprises(query: Omit<ListEnterprisesQuery, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: enterpriseKeys.list(query),
    queryFn: ({ pageParam, signal }) => enterprisesApi.list({ ...query, cursor: pageParam ?? undefined }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next_cursor,
  });
}

/** Toàn bộ DN (tối đa 200) cho select — đủ cho quy mô hiện tại. */
export function useAllEnterprises() {
  return useQuery({ queryKey: ['enterprises', 'all'], queryFn: ({ signal }) => enterprisesApi.list({ limit: 200 }, signal).then((p) => p.items), staleTime: 60_000 });
}

export function useEnterprise(id: string) {
  return useQuery({ queryKey: enterpriseKeys.detail(id), queryFn: ({ signal }) => enterprisesApi.get(id, signal) });
}

export function useBranches(id: string) {
  return useQuery({ queryKey: enterpriseKeys.branches(id), queryFn: ({ signal }) => enterprisesApi.branches(id, signal).then((r) => r.items) });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: enterpriseKeys.all });
}

export function useCreateEnterprise() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: CreateEnterpriseInput) => enterprisesApi.create(input), onSuccess: invalidate });
}
export function useUpdateEnterprise(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: UpdateEnterpriseInput) => enterprisesApi.update(id, input), onSuccess: invalidate });
}
export function useChangeEnterpriseStatus() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (v: { id: string; status: EnterpriseStatus; reason?: string }) => enterprisesApi.changeStatus(v.id, v.status, v.reason), onSuccess: invalidate });
}
export function useDeleteEnterprise() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => enterprisesApi.delete(id), onSuccess: invalidate });
}
