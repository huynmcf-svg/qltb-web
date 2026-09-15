export type ExchangeStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DeviceExchange {
  exchange_id: string;
  enterprise_id: string;
  enterprise_name: string;
  old_device_id: string;
  old_serial_number: string;
  new_device_id: string | null;
  new_serial_number: string | null;
  reason: string;
  status: ExchangeStatus;
  requested_by: string;
  requested_by_name: string | null;
  requested_at: string;
  approved_by: string | null;
  approved_by_name: string | null;
  approved_at: string | null;
  reject_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
