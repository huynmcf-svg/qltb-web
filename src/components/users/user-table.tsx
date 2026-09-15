'use client';

import { KeyRound, Lock, LockOpen, MoreHorizontal, Pencil, Plus, Trash2, UserCog } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DataTable, type Column } from '@/components/common/data-table';
import { EnterpriseSelect } from '@/components/common/enterprise-select';
import { FilterBar, SearchInput } from '@/components/common/filter-bar';
import { SecretReveal } from '@/components/common/secret-reveal';
import { useSession } from '@/components/common/session-provider';
import { UserStatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounced } from '@/hooks/use-debounced';
import { useDeleteUser, useResetUserPassword, useRoles, useSetUserDisabled, useUsers } from '@/hooks/use-users';
import { formatDateTime } from '@/lib/utils/date';
import type { User, UserStatus } from '@/types/user';
import { AssignRolesDialog } from './assign-roles-dialog';
import { UserFormDialog } from './user-form-dialog';

const ALL = '__all__';
type Modal = null | { kind: 'create' } | { kind: 'edit' | 'roles' | 'disable' | 'enable' | 'reset' | 'delete'; user: User };

export function UserTable() {
  const { can, user: me } = useSession();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [enterprise, setEnterprise] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const roles = useRoles();
  const query = useUsers({ q: useDebounced(q, 300) || undefined, status: (status || undefined) as UserStatus | undefined, role_code: role || undefined, enterprise_id: enterprise || undefined });
  const setDisabled = useSetUserDisabled();
  const reset = useResetUserPassword();
  const del = useDeleteUser();
  const rows = query.data?.pages.flatMap((p) => p.items) ?? [];

  const columns: Column<User>[] = [
    { key: 'username', header: 'Tài khoản', cell: (u) => <div><div className="font-medium">{u.full_name}</div><div className="font-mono text-xs text-muted-foreground">@{u.username}</div></div> },
    { key: 'enterprise', header: 'Doanh nghiệp', cell: (u) => u.enterprise_name ?? <span className="text-muted-foreground">Hệ thống</span> },
    { key: 'roles', header: 'Vai trò', cell: (u) => u.roles.map((r) => r.name).join(', ') },
    { key: 'contact', header: 'Liên hệ', cell: (u) => <div className="text-xs text-muted-foreground">{u.email ?? ''}<br />{u.phone ?? ''}</div> },
    { key: 'status', header: 'Trạng thái', cell: (u) => <div className="flex flex-col gap-1"><UserStatusBadge status={u.status} />{u.locked_until && new Date(u.locked_until) > new Date() && <span className="text-[11px] text-danger">khoá tạm tới {formatDateTime(u.locked_until)}</span>}{u.must_change_password && <span className="text-[11px] text-muted-foreground">phải đổi mật khẩu</span>}</div> },
    { key: 'login', header: 'Đăng nhập gần nhất', className: 'tabular', cell: (u) => formatDateTime(u.last_login_at) },
    {
      key: 'actions', header: '', className: 'w-10', cell: (u) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Thao tác"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {can('user.update') && <DropdownMenuItem onClick={() => setModal({ kind: 'edit', user: u })}><Pencil />Sửa thông tin</DropdownMenuItem>}
            {can('user.assign_role') && <DropdownMenuItem onClick={() => setModal({ kind: 'roles', user: u })}><UserCog />Gán vai trò</DropdownMenuItem>}
            {can('user.update') && <DropdownMenuItem onClick={() => setModal({ kind: 'reset', user: u })}><KeyRound />Đặt lại mật khẩu</DropdownMenuItem>}
            {can('user.disable') && u.user_id !== me?.user_id && (u.status === 'ACTIVE' ? <DropdownMenuItem onClick={() => setModal({ kind: 'disable', user: u })}><Lock />Khoá tài khoản</DropdownMenuItem> : <DropdownMenuItem onClick={() => setModal({ kind: 'enable', user: u })}><LockOpen />Mở khoá</DropdownMenuItem>)}
            {can('user.delete') && u.user_id !== me?.user_id && <><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => setModal({ kind: 'delete', user: u })}><Trash2 />Xoá</DropdownMenuItem></>}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  const m = modal && 'user' in modal ? modal.user : null;

  return (
    <>
      <FilterBar>
        <SearchInput value={q} onChange={setQ} placeholder="Tên đăng nhập, họ tên, email…" />
        <Select value={status || ALL} onValueChange={(v) => setStatus(v === ALL ? '' : v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Mọi trạng thái</SelectItem><SelectItem value="ACTIVE">Hoạt động</SelectItem><SelectItem value="DISABLED">Đã khoá</SelectItem></SelectContent></Select>
        <Select value={role || ALL} onValueChange={(v) => setRole(v === ALL ? '' : v)}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Mọi vai trò</SelectItem>{roles.data?.map((r) => <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>)}</SelectContent></Select>
        {me?.enterprise_id === null && <EnterpriseSelect value={enterprise} onChange={setEnterprise} allowAll />}
        <div className="ml-auto">{can('user.create') && <Button onClick={() => setModal({ kind: 'create' })}><Plus />Tạo tài khoản</Button>}</div>
      </FilterBar>
      <DataTable columns={columns} rows={rows} rowKey={(u) => u.user_id} isPending={query.isPending} error={query.error} hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} onLoadMore={() => query.fetchNextPage()} />

      <UserFormDialog open={modal?.kind === 'create' || modal?.kind === 'edit'} onOpenChange={(o) => !o && setModal(null)} user={modal?.kind === 'edit' ? modal.user : undefined} />
      <AssignRolesDialog open={modal?.kind === 'roles'} onOpenChange={(o) => !o && setModal(null)} user={m} />
      <ConfirmDialog open={modal?.kind === 'disable'} onOpenChange={(o) => !o && setModal(null)} title={`Khoá tài khoản ${m?.username}`} description="Mọi phiên đang đăng nhập bị huỷ ngay." reasonLabel="Lý do" confirmLabel="Khoá" destructive onConfirm={(reason) => setDisabled.mutateAsync({ id: m!.user_id, disabled: true, reason })} successMessage="Đã khoá" />
      <ConfirmDialog open={modal?.kind === 'enable'} onOpenChange={(o) => !o && setModal(null)} title={`Mở khoá ${m?.username}`} confirmLabel="Mở khoá" onConfirm={() => setDisabled.mutateAsync({ id: m!.user_id, disabled: false })} successMessage="Đã mở khoá" />
      <ConfirmDialog open={modal?.kind === 'reset'} onOpenChange={(o) => !o && setModal(null)} title={`Đặt lại mật khẩu cho ${m?.username}`} description="Hệ thống sinh mật khẩu tạm, huỷ mọi phiên của người này; họ phải đổi mật khẩu ở lần đăng nhập sau." confirmLabel="Đặt lại" onConfirm={async () => { const r = await reset.mutateAsync({ id: m!.user_id }); if (r.temporary_password) setTempPassword(r.temporary_password); else toast.success('Đã đặt lại'); }} />
      <ConfirmDialog open={modal?.kind === 'delete'} onOpenChange={(o) => !o && setModal(null)} title={`Xoá tài khoản ${m?.username}`} description="Tài khoản bị vô hiệu vĩnh viễn, tên đăng nhập được giải phóng. Nhật ký vẫn giữ." confirmLabel="Xoá" destructive onConfirm={() => del.mutateAsync(m!.user_id)} successMessage="Đã xoá" />
      {tempPassword && (
        <Dialog open onOpenChange={() => setTempPassword(null)}>
          <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Mật khẩu tạm</DialogTitle></DialogHeader><SecretReveal label="Mật khẩu tạm" value={tempPassword} /><DialogFooter><Button onClick={() => setTempPassword(null)}>Đóng</Button></DialogFooter></DialogContent>
        </Dialog>
      )}
    </>
  );
}
