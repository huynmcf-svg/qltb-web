import type { ChangePasswordInput, LoginRequest, LoginResponse, SessionUser, UpdateProfileInput } from '@/types/auth';
import { apiFetch } from './client';

/** Hợp đồng `/auth/*` — docs/api-contracts.md mục 1. Refresh ở `lib/auth/refresh.ts`. */
export const authApi = {
  login: (input: LoginRequest) =>
    apiFetch<LoginResponse>('/auth/login', { method: 'POST', body: input, skipRefresh: true }),

  logout: () => apiFetch<null>('/auth/logout', { method: 'POST', skipRefresh: true }),

  me: (signal?: AbortSignal) => apiFetch<SessionUser>('/auth/me', { signal }),

  changePassword: (input: ChangePasswordInput) =>
    apiFetch<null>('/auth/change-password', { method: 'PUT', body: input }),

  updateProfile: (input: UpdateProfileInput) =>
    apiFetch<SessionUser>('/auth/profile', { method: 'PUT', body: input }),
};
