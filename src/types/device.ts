/** Khớp resource `Device` trong docs/api-contracts.md. */

export const DEVICE_STATUSES = ['IN_STOCK', 'IN_USE', 'UNDER_MAINTENANCE', 'DISPOSED'] as const;
export type DeviceStatus = (typeof DEVICE_STATUSES)[number];

export interface Device {
  device_id: string;
  code: string;
  name: string;
  category_id: string;
  category_name: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  status: DeviceStatus;
  holder_name: string | null;
  holder_unit: string | null;
  /** YYYY-MM-DD */
  purchased_at: string | null;
  warranty_until: string | null;
  purchase_price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListDevicesQuery {
  limit?: number;
  cursor?: string;
  status?: DeviceStatus;
  category_id?: string;
  q?: string;
}

export interface CreateDeviceInput {
  code: string;
  name: string;
  category_id: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchased_at?: string;
  warranty_until?: string;
  purchase_price?: number;
  notes?: string;
}

export type UpdateDeviceInput = Partial<Omit<CreateDeviceInput, 'code'>>;
