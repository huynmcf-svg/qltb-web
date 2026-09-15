import type { CursorPage } from '@/types/api';
import type { AssignDeviceInput, ChangeDeviceStatusInput, CreateDeviceInput, Device, DeviceDetail, DeviceType, ListDevicesQuery, UpdateDeviceInput, Warranty } from '@/types/device';
import type { ListUsageQuery, UsageLog } from '@/types/quota';
import type { WarrantyRow } from '@/types/warranty';
import { apiFetch } from './client';
import { q } from './query';

/** Một module API một file. Component không gọi trực tiếp — đi qua hooks/. */
export const devicesApi = {
  types: (signal?: AbortSignal) => apiFetch<{ items: DeviceType[] }>('/devices/types', { signal }),
  list: (query: ListDevicesQuery = {}, signal?: AbortSignal) => apiFetch<CursorPage<Device>>('/devices', { query: q(query), signal }),
  get: (device_id: string, signal?: AbortSignal) => apiFetch<DeviceDetail>(`/devices/${device_id}`, { signal }),
  create: (input: CreateDeviceInput) => apiFetch<DeviceDetail>('/devices', { method: 'POST', body: input }),
  update: (device_id: string, input: UpdateDeviceInput) => apiFetch<DeviceDetail>(`/devices/${device_id}`, { method: 'PUT', body: input }),
  assign: (device_id: string, input: AssignDeviceInput) => apiFetch<DeviceDetail & { api_key: string }>(`/devices/${device_id}/assign`, { method: 'PUT', body: input }),
  unassign: (device_id: string, reason: string) => apiFetch<DeviceDetail>(`/devices/${device_id}/unassign`, { method: 'PUT', body: { reason } }),
  changeStatus: (device_id: string, input: ChangeDeviceStatusInput) => apiFetch<DeviceDetail>(`/devices/${device_id}/status`, { method: 'PUT', body: input }),
  rotateApiKey: (device_id: string) => apiFetch<{ api_key: string }>(`/devices/${device_id}/api-key`, { method: 'POST' }),
  usage: (device_id: string, query: Omit<ListUsageQuery, 'device_id'> = {}, signal?: AbortSignal) => apiFetch<CursorPage<UsageLog>>(`/devices/${device_id}/usage`, { query: q(query), signal }),
  warranties: (device_id: string, signal?: AbortSignal) => apiFetch<{ items: (WarrantyRow & Warranty)[] }>(`/devices/${device_id}/warranties`, { signal }),
  delete: (device_id: string) => apiFetch<null>(`/devices/${device_id}`, { method: 'DELETE' }),
};
