export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface UserRoleRef {
  role_id: string;
  code: string;
  name: string;
}

export interface User {
  user_id: string;
  username: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  enterprise_id: string | null;
  enterprise_name: string | null;
  roles: UserRoleRef[];
  status: UserStatus;
  must_change_password: boolean;
  locked_until: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListUsersQuery {
  limit?: number;
  cursor?: string;
  enterprise_id?: string;
  role_code?: string;
  status?: UserStatus;
  q?: string;
}

export interface CreateUserInput {
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  enterprise_id?: string;
  role_ids: string[];
  password?: string;
}

export type UpdateUserInput = Partial<Pick<CreateUserInput, 'full_name' | 'email' | 'phone'>>;

export interface Permission {
  code: string;
  name: string;
  group: string;
}

export interface Role {
  role_id: string;
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: string[];
  user_count: number;
  created_at: string;
  updated_at: string;
}
