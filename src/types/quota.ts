import type { DeviceQuota, DeviceStatus } from './device';

export interface QuotaRow extends DeviceQuota {
  serial_number: string;
  device_name: string | null;
  device_status: DeviceStatus;
  enterprise_id: string | null;
  enterprise_name: string | null;
}

export interface ListQuotasQuery {
  limit?: number;
  cursor?: string;
  enterprise_id?: string;
  is_locked?: boolean;
  below_pct?: number;
  q?: string;
}

export interface QuotaGrant {
  grant_id: string;
  device_id: string;
  amount: number;
  total_after: number;
  granted_by: string | null;
  granted_by_name: string | null;
  note: string | null;
  granted_at: string;
}

export interface QuotaAllocation {
  allocation_id: string;
  from_enterprise_id: string;
  from_enterprise_name: string;
  to_enterprise_id: string;
  to_enterprise_name: string;
  from_device_id: string;
  from_serial_number: string;
  device_id: string;
  serial_number: string;
  amount: number;
  allocated_by: string | null;
  allocated_by_name: string | null;
  note: string | null;
  allocated_at: string;
}

export interface AllocateInput {
  from_enterprise_id: string;
  to_enterprise_id: string;
  from_device_id: string;
  device_id: string;
  amount: number;
  note?: string;
}

export interface UsageLog {
  usage_id: string;
  device_id: string;
  serial_number: string;
  client_ref: string;
  amount: number;
  used_at: string;
  received_at: string;
  rejected: boolean;
  remaining_after: number | null;
  meta: Record<string, unknown>;
}

export interface ListUsageQuery {
  limit?: number;
  cursor?: string;
  device_id?: string;
  enterprise_id?: string;
  from?: string;
  to?: string;
  rejected?: boolean;
}
