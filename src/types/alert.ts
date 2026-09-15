export type AlertType =
  | 'QUOTA_BELOW_20' | 'QUOTA_BELOW_10' | 'QUOTA_EXHAUSTED'
  | 'WARRANTY_30D' | 'WARRANTY_15D' | 'WARRANTY_7D' | 'WARRANTY_EXPIRED'
  | 'DEVICE_OFFLINE';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertGroup = 'QUOTA' | 'WARRANTY' | 'DEVICE';

export interface Alert {
  alert_id: string;
  device_id: string;
  serial_number: string;
  enterprise_id: string | null;
  enterprise_name: string | null;
  type: AlertType;
  group: AlertGroup;
  severity: AlertSeverity;
  message: string;
  payload: Record<string, unknown>;
  occurred_at: string;
  resolved_at: string | null;
}

export interface ListAlertsQuery {
  limit?: number;
  cursor?: string;
  group?: AlertGroup;
  severity?: AlertSeverity;
  enterprise_id?: string;
  device_id?: string;
  from?: string;
  to?: string;
  resolved?: boolean;
}

export interface Notification {
  notification_id: string;
  alert_id: string;
  title: string;
  body: string;
  alert: { type: AlertType; severity: AlertSeverity; device_id: string; serial_number: string };
  read_at: string | null;
  created_at: string;
}
