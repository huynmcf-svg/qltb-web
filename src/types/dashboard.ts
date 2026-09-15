export interface AdminDashboard {
  enterprise_count: number;
  device_count: number;
  devices_by_status: Record<string, number>;
  quota_used_total: number;
  devices_quota_low: number;
  devices_warranty_expiring: number;
  devices_offline: number;
  open_alerts: number;
}

export interface BusinessDashboardDevice {
  device_id: string;
  serial_number: string;
  name: string | null;
  status: string;
  quota_total: number;
  quota_remaining: number;
  remaining_pct: number | null;
  is_online: boolean;
  is_locked: boolean;
}

export interface BusinessDashboard {
  device_count: number;
  devices: BusinessDashboardDevice[];
  quota_used_total: number;
  quota_remaining_total: number;
  unread_notifications: number;
}

export interface UsagePoint {
  bucket: string;
  amount: number;
}
