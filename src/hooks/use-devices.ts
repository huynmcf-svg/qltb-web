'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { devicesApi } from '@/lib/api/devices';
import type { AssignDeviceInput, ChangeDeviceStatusInput, CreateDeviceInput, ListDevicesQuery, UpdateDeviceInput } from '@/types/device';

/** Cache key gom một chỗ để invalidate đúng. Component dùng hook, không gọi API trực tiếp. */
export const deviceKeys = {
  all: ['devices'] as const,
  types: ['devices', 'types'] as const,
  list: (query: Omit<ListDevicesQuery, 'cursor'>) => ['devices', 'list', query] as const,
  detail: (device_id: string) => ['devices', 'detail', device_id] as const,
  usage: (device_id: string) => ['devices', 'usage', device_id] as const,
  warranties: (device_id: string) => ['devices', 'warranties', device_id] as const,
};

export function useDeviceTypes() {
  return useQuery({ queryKey: deviceKeys.types, queryFn: ({ signal }) => devicesApi.types(signal), staleTime: Infinity });
}

export function useDevices(query: Omit<ListDevicesQuery, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: deviceKeys.list(query),
    queryFn: ({ pageParam, signal }) => devicesApi.list({ ...query, cursor: pageParam ?? undefined }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next_cursor, // opaque — truyền nguyên, không đọc
  });
}

export function useDevice(device_id: string) {
  return useQuery({ queryKey: deviceKeys.detail(device_id), queryFn: ({ signal }) => devicesApi.get(device_id, signal) });
}

export function useDeviceUsage(device_id: string) {
  return useInfiniteQuery({
    queryKey: deviceKeys.usage(device_id),
    queryFn: ({ pageParam, signal }) => devicesApi.usage(device_id, { cursor: pageParam ?? undefined }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next_cursor,
  });
}

export function useDeviceWarranties(device_id: string) {
  return useQuery({ queryKey: deviceKeys.warranties(device_id), queryFn: ({ signal }) => devicesApi.warranties(device_id, signal) });
}

function useInvalidateDevices() {
  const qc = useQueryClient();
  return () => Promise.all([qc.invalidateQueries({ queryKey: deviceKeys.all }), qc.invalidateQueries({ queryKey: ['quotas'] }), qc.invalidateQueries({ queryKey: ['dashboard'] })]);
}

export function useCreateDevice() {
  const invalidate = useInvalidateDevices();
  return useMutation({ mutationFn: (input: CreateDeviceInput) => devicesApi.create(input), onSuccess: invalidate });
}

export function useUpdateDevice(device_id: string) {
  const invalidate = useInvalidateDevices();
  return useMutation({ mutationFn: (input: UpdateDeviceInput) => devicesApi.update(device_id, input), onSuccess: invalidate });
}

export function useAssignDevice(device_id: string) {
  const invalidate = useInvalidateDevices();
  return useMutation({ mutationFn: (input: AssignDeviceInput) => devicesApi.assign(device_id, input), onSuccess: invalidate });
}

export function useUnassignDevice(device_id: string) {
  const invalidate = useInvalidateDevices();
  return useMutation({ mutationFn: (reason: string) => devicesApi.unassign(device_id, reason), onSuccess: invalidate });
}

export function useChangeDeviceStatus(device_id: string) {
  const invalidate = useInvalidateDevices();
  return useMutation({ mutationFn: (input: ChangeDeviceStatusInput) => devicesApi.changeStatus(device_id, input), onSuccess: invalidate });
}

export function useRotateApiKey(device_id: string) {
  return useMutation({ mutationFn: () => devicesApi.rotateApiKey(device_id) });
}

export function useDeleteDevice() {
  const invalidate = useInvalidateDevices();
  return useMutation({ mutationFn: (device_id: string) => devicesApi.delete(device_id), onSuccess: invalidate });
}
