'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { devicesApi } from '@/lib/api/devices';
import { newIdempotencyKey } from '@/lib/api/client';
import type { CreateDeviceInput, ListDevicesQuery, UpdateDeviceInput } from '@/types/device';

/**
 * Cache key gom một chỗ để invalidate đúng. Component dùng hook này, không gọi
 * `devicesApi` trực tiếp.
 */
export const deviceKeys = {
  all: ['devices'] as const,
  list: (query: Omit<ListDevicesQuery, 'cursor'>) => ['devices', 'list', query] as const,
  detail: (device_id: string) => ['devices', 'detail', device_id] as const,
};

export function useDevices(query: Omit<ListDevicesQuery, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: deviceKeys.list(query),
    queryFn: ({ pageParam, signal }) =>
      devicesApi.list({ ...query, cursor: pageParam ?? undefined }, signal),
    initialPageParam: null as string | null,
    // `next_cursor` là opaque — truyền nguyên, không đọc.
    getNextPageParam: (last) => last.next_cursor,
  });
}

export function useDevice(device_id: string) {
  return useQuery({
    queryKey: deviceKeys.detail(device_id),
    queryFn: ({ signal }) => devicesApi.get(device_id, signal),
  });
}

export function useCreateDevice() {
  const qc = useQueryClient();
  // Một key cho một lần mở form; retry cùng thao tác thì giữ nguyên key.
  const key = newIdempotencyKey();
  return useMutation({
    mutationFn: (input: CreateDeviceInput) => devicesApi.create(input, key),
    onSuccess: () => qc.invalidateQueries({ queryKey: deviceKeys.all }),
  });
}

export function useUpdateDevice(device_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDeviceInput) => devicesApi.update(device_id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}
