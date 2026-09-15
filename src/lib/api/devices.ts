import type { CursorPage } from '@/types/api';
import type { CreateDeviceInput, Device, ListDevicesQuery, UpdateDeviceInput } from '@/types/device';
import { apiFetch } from './client';

/** Một module API một file. Component không gọi trực tiếp — đi qua hooks/use-devices.ts. */
export const devicesApi = {
  list: (query: ListDevicesQuery = {}, signal?: AbortSignal) =>
    apiFetch<CursorPage<Device>>('/devices', { query: { ...query }, signal }),

  get: (device_id: string, signal?: AbortSignal) =>
    apiFetch<Device>(`/devices/${device_id}`, { signal }),

  create: (input: CreateDeviceInput, idempotencyKey: string) =>
    apiFetch<Device>('/devices', { method: 'POST', body: input, idempotencyKey }),

  update: (device_id: string, input: UpdateDeviceInput) =>
    apiFetch<Device>(`/devices/${device_id}`, { method: 'PATCH', body: input }),
};
