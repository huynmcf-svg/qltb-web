'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesApi, usersApi } from '@/lib/api/users';
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from '@/types/user';

export const userKeys = {
  all: ['users'] as const,
  list: (query: Omit<ListUsersQuery, 'cursor'>) => ['users', 'list', query] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};
export const roleKeys = { all: ['roles'] as const, permissions: ['roles', 'permissions'] as const };

export function useUsers(query: Omit<ListUsersQuery, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: userKeys.list(query),
    queryFn: ({ pageParam, signal }) => usersApi.list({ ...query, cursor: pageParam ?? undefined }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next_cursor,
  });
}

export function useRoles() {
  return useQuery({ queryKey: roleKeys.all, queryFn: ({ signal }) => rolesApi.list(signal).then((r) => r.items), staleTime: 60_000 });
}
export function usePermissions() {
  return useQuery({ queryKey: roleKeys.permissions, queryFn: ({ signal }) => rolesApi.permissions(signal).then((r) => r.items), staleTime: Infinity });
}

function useInvalidateUsers() {
  const qc = useQueryClient();
  return () => Promise.all([qc.invalidateQueries({ queryKey: userKeys.all }), qc.invalidateQueries({ queryKey: roleKeys.all }), qc.invalidateQueries({ queryKey: ['enterprises'] })]);
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: (input: CreateUserInput) => usersApi.create(input), onSuccess: invalidate });
}
export function useUpdateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: (v: { id: string; input: UpdateUserInput }) => usersApi.update(v.id, v.input), onSuccess: invalidate });
}
export function useSetUserDisabled() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: (v: { id: string; disabled: boolean; reason?: string }) => usersApi.setDisabled(v.id, v.disabled, v.reason), onSuccess: invalidate });
}
export function useAssignRoles() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: (v: { id: string; role_ids: string[] }) => usersApi.assignRoles(v.id, v.role_ids), onSuccess: invalidate });
}
export function useResetUserPassword() {
  return useMutation({ mutationFn: (v: { id: string; new_password?: string }) => usersApi.resetPassword(v.id, v.new_password) });
}
export function useDeleteUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: (id: string) => usersApi.delete(id), onSuccess: invalidate });
}

export function useCreateRole() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: (input: Parameters<typeof rolesApi.create>[0]) => rolesApi.create(input), onSuccess: invalidate });
}
export function useUpdateRole() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: (v: { id: string; input: { name?: string; description?: string } }) => rolesApi.update(v.id, v.input), onSuccess: invalidate });
}
export function useSetRolePermissions() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: (v: { id: string; permission_codes: string[] }) => rolesApi.setPermissions(v.id, v.permission_codes), onSuccess: invalidate });
}
export function useDeleteRole() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: (id: string) => rolesApi.delete(id), onSuccess: invalidate });
}
