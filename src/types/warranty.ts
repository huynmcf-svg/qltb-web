import type { Warranty } from './device';

export interface WarrantyRow extends Warranty {
  serial_number: string;
  enterprise_name: string | null;
}

export interface ListWarrantiesQuery {
  limit?: number;
  cursor?: string;
  status?: Warranty['status'];
  enterprise_id?: string;
  device_id?: string;
  expiring_within_days?: number;
  q?: string;
}
