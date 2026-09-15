/** Khớp resource `Device` / `DeviceQuota` / `Warranty` trong docs/api-contracts.md mục 4–6. */

export const DEVICE_STATUSES = ['IN_STOCK', 'ACTIVE', 'LOCKED', 'EXCHANGED', 'RETIRED'] as const;
export type DeviceStatus = (typeof DEVICE_STATUSES)[number];

export type WarrantyStatus = 'ACTIVE' | 'EXPIRED' | 'TRANSFERRED' | 'VOID';
export type WarrantySource = 'SALE' | 'EXCHANGE' | 'EXTENSION';

export interface Device {
  device_id: string;
  serial_number: string;
  device_type: string;
  model: string | null;
  name: string | null;
  firmware_version: string | null;
  enterprise_id: string | null;
  enterprise_name: string | null;
  status: DeviceStatus;
  /** YYYY-MM-DD */
  sold_at: string | null;
  assigned_at: string | null;
  last_seen_at: string | null;
  is_online: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeviceQuota {
  device_id: string;
  quota_total: number;
  quota_used: number;
  quota_remaining: number;
  /** `null` khi chưa cấp sản lượng. */
  remaining_pct: number | null;
  warn_threshold_pct: number;
  package_start_at: string | null;
  package_end_at: string | null;
  is_locked: boolean;
  locked_reason: string | null;
  locked_at: string | null;
  updated_at: string;
}

export interface Warranty {
  warranty_id: string;
  device_id: string;
  enterprise_id: string | null;
  start_date: string;
  end_date: string;
  status: WarrantyStatus;
  source: WarrantySource;
  days_remaining: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeviceDetail extends Device {
  quota: DeviceQuota;
  warranty: Warranty | null;
}

export interface ListDevicesQuery {
  limit?: number;
  cursor?: string;
  enterprise_id?: string;
  device_type?: string;
  status?: DeviceStatus;
  q?: string;
}

export interface CreateDeviceInput {
  serial_number: string;
  device_type: string;
  model?: string;
  name?: string;
  firmware_version?: string;
  notes?: string;
}

export type UpdateDeviceInput = Partial<Omit<CreateDeviceInput, 'serial_number' | 'device_type'>>;

export interface DeviceType {
  code: string;
  name: string;
}

export interface AssignDeviceInput {
  enterprise_id: string;
  sold_at?: string;
  warranty_months?: number;
  note?: string;
}

export interface ChangeDeviceStatusInput {
  status: 'ACTIVE' | 'LOCKED' | 'RETIRED';
  reason: string;
}
