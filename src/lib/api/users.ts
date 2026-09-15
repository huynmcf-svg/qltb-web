import type { CursorPage } from '@/types/api';
import type { CreateUserInput, ListUsersQuery, Permission, Role, UpdateUserInput, User } from '@/types/user';
import { apiFetch } from './client';
import { q } from './query';

export const usersApi = {
  list: (query: ListUsersQuery = {}, signal?: AbortSignal) => apiFetch<CursorPage<User>>('/users', { query: q(query), signal }),
  get: (id: string, signal?: AbortSignal) => apiFetch<User>(`/users/${id}`, { signal }),
  create: (input: CreateUserInput) => apiFetch<User & { temporary_password?: string }>('/users', { method: 'POST', body: input }),
  update: (id: string, input: UpdateUserInput) => apiFetch<User>(`/users/${id}`, { method: 'PUT', body: input }),
  setDisabled: (id: string, disabled: boolean, reason?: string) => apiFetch<User>(`/users/${id}/disable`, { method: 'PUT', body: { disabled, reason } }),
  assignRoles: (id: string, role_ids: string[]) => apiFetch<User>(`/users/${id}/roles`, { method: 'PUT', body: { role_ids } }),
  resetPassword: (id: string, new_password?: string) => apiFetch<{ temporary_password?: string }>(`/users/${id}/reset-password`, { method: 'PUT', body: new_password ? { new_password } : {} }),
  delete: (id: string) => apiFetch<null>(`/users/${id}`, { method: 'DELETE' }),
};

export const rolesApi = {
  list: (signal?: AbortSignal) => apiFetch<{ items: Role[] }>('/roles', { signal }),
  get: (id: string, signal?: AbortSignal) => apiFetch<Role>(`/roles/${id}`, { signal }),
  permissions: (signal?: AbortSignal) => apiFetch<{ items: Permission[] }>('/permissions', { signal }),
  create: (input: { code: string; name: string; description?: string; permission_codes: string[] }) => apiFetch<Role>('/roles', { method: 'POST', body: input }),
  update: (id: string, input: { name?: string; description?: string }) => apiFetch<Role>(`/roles/${id}`, { method: 'PUT', body: input }),
  setPermissions: (id: string, permission_codes: string[]) => apiFetch<Role>(`/roles/${id}/permissions`, { method: 'PUT', body: { permission_codes } }),
  delete: (id: string) => apiFetch<null>(`/roles/${id}`, { method: 'DELETE' }),
};
