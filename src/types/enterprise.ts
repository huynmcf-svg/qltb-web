export type EnterpriseStatus = 'ACTIVE' | 'SUSPENDED';

export interface Enterprise {
  enterprise_id: string;
  parent_id: string | null;
  parent_name: string | null;
  code: string;
  name: string;
  tax_code: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  contact_name: string | null;
  status: EnterpriseStatus;
  max_users: number;
  user_count: number;
  device_count: number;
  branch_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListEnterprisesQuery {
  limit?: number;
  cursor?: string;
  status?: EnterpriseStatus;
  parent_id?: string;
  q?: string;
}

export interface CreateEnterpriseInput {
  code: string;
  name: string;
  parent_id?: string;
  tax_code?: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_name?: string;
  max_users?: number;
}

export type UpdateEnterpriseInput = Partial<Omit<CreateEnterpriseInput, 'code' | 'parent_id'>>;
