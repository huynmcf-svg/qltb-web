export interface AuditLog {
  audit_id: string;
  enterprise_id: string | null;
  enterprise_name: string | null;
  actor_user_id: string | null;
  actor_username: string | null;
  module: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  request_id: string | null;
  ip: string | null;
  user_agent: string | null;
  occurred_at: string;
}

export interface ListAuditQuery {
  limit?: number;
  cursor?: string;
  actor_user_id?: string;
  enterprise_id?: string;
  module?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  from?: string;
  to?: string;
}
