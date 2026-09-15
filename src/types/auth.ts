/** Khớp mục "Auth" trong docs/api-contracts.md. */

export interface SessionUser {
  user_id: string;
  username: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  /** `null` = quản trị hệ thống. */
  enterprise_id: string | null;
  enterprise_name: string | null;
  roles: string[];
  permissions: string[];
  must_change_password: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  /** Giây. */
  expires_in: number;
  user: SessionUser;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileInput {
  full_name?: string;
  email?: string;
  phone?: string;
}
