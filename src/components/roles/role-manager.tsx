'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Field } from '@/components/common/field';
import { FormError } from '@/components/common/form-error';
import { useSession } from '@/components/common/session-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCreateRole, useDeleteRole, usePermissions, useRoles, useSetRolePermissions, useUpdateRole } from '@/hooks/use-users';
import { cn } from '@/lib/utils/cn';
import { describeError } from '@/lib/utils/errors';
import type { Role } from '@/types/user';
import { PermissionMatrix } from './permission-matrix';

export function RoleManager() {
  const { can, user } = useSession();
  const isAdmin = user?.enterprise_id === null && can('role.manage');
  const roles = useRoles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const role = roles.data?.find((r) => r.role_id === selectedId) ?? roles.data?.[0] ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <Card className="h-fit">
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Vai trò</CardTitle>{isAdmin && <Button size="sm" variant="outline" onClick={() => setCreating(true)}><Plus />Tạo</Button>}</CardHeader>
        <CardContent className="space-y-1 p-2">
          {roles.data?.map((r) => (
            <button key={r.role_id} onClick={() => setSelectedId(r.role_id)} className={cn('flex w-full flex-col items-start rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent', role?.role_id === r.role_id && 'bg-primary/10 text-primary')}>
              <span className="font-medium">{r.name}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{r.code} · {r.user_count} người · {r.permissions.length} quyền</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* key theo role_id + updated_at: đổi vai trò hay vừa lưu xong là editor dựng lại với state mới — không cần effect đồng bộ. */}
      {role && <RoleEditor key={`${role.role_id}:${role.updated_at}`} role={role} isAdmin={!!isAdmin} onDeleted={() => setSelectedId(null)} />}

      <CreateRoleDialog open={creating} onOpenChange={setCreating} onCreated={setSelectedId} />
    </div>
  );
}

function RoleEditor({ role, isAdmin, onDeleted }: { role: Role; isAdmin: boolean; onDeleted: () => void }) {
  const perms = usePermissions();
  const setPerms = useSetRolePermissions();
  const update = useUpdateRole();
  const del = useDeleteRole();
  const [draft, setDraft] = useState<string[]>(role.permissions);
  const [name, setName] = useState(role.name);
  const [desc, setDesc] = useState(role.description ?? '');
  const [deleting, setDeleting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const dirty = JSON.stringify([...draft].sort()) !== JSON.stringify([...role.permissions].sort()) || name !== role.name || desc !== (role.description ?? '');

  async function save() {
    setFailure(null);
    try {
      if (name !== role.name || desc !== (role.description ?? '')) await update.mutateAsync({ id: role.role_id, input: { name, description: desc || undefined } });
      if (JSON.stringify([...draft].sort()) !== JSON.stringify([...role.permissions].sort())) await setPerms.mutateAsync({ id: role.role_id, permission_codes: draft });
      toast.success('Đã lưu vai trò');
    } catch (error) { setFailure(describeError(error)); }
  }

  return (
    <>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2"><CardTitle>{role.name}</CardTitle>{role.is_system && <Badge variant="secondary">Vai trò hệ thống</Badge>}<span className="font-mono text-xs text-muted-foreground">{role.code}</span></div>
              {isAdmin && !role.is_system && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Tên" htmlFor="role-name"><Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
                  <Field label="Mô tả" htmlFor="role-desc"><Input id="role-desc" value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
                </div>
              )}
              {(!isAdmin || role.is_system) && role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
            </div>
            {isAdmin && !role.is_system && (
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-danger" onClick={() => setDeleting(true)} aria-label="Xoá vai trò"><Trash2 /></Button>
                <Button onClick={save} disabled={!dirty || setPerms.isPending || update.isPending}>{(setPerms.isPending || update.isPending) && <Loader2 className="animate-spin" />}Lưu</Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <FormError message={failure} />
            {role.is_system && <p className="text-xs text-muted-foreground">Vai trò hệ thống là bộ mặc định — không sửa được ma trận. Cần khác thì tạo vai trò mới.</p>}
            <PermissionMatrix permissions={perms.data ?? []} selected={draft} onChange={setDraft} readOnly={!isAdmin || role.is_system} />
          </CardContent>
        </Card>
      <ConfirmDialog open={deleting} onOpenChange={setDeleting} title={`Xoá vai trò ${role.name}`} description="Chỉ xoá được khi không còn ai gán." confirmLabel="Xoá" destructive onConfirm={async () => { await del.mutateAsync(role.role_id); onDeleted(); }} successMessage="Đã xoá vai trò" />
    </>
  );
}

function CreateRoleDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (id: string) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">{open && <CreateRoleBody onOpenChange={onOpenChange} onCreated={onCreated} />}</DialogContent>
    </Dialog>
  );
}

function CreateRoleBody({ onOpenChange, onCreated }: { onOpenChange: (o: boolean) => void; onCreated: (id: string) => void }) {
  const perms = usePermissions();
  const create = useCreateRole();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [failure, setFailure] = useState<string | null>(null);

  async function submit() {
    if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(code)) { setFailure('Mã là UPPER_SNAKE_CASE, ví dụ BRANCH_MANAGER.'); return; }
    if (!name.trim()) { setFailure('Nhập tên vai trò.'); return; }
    try { const r = await create.mutateAsync({ code, name: name.trim(), description: desc.trim() || undefined, permission_codes: selected }); toast.success('Đã tạo vai trò'); onCreated(r.role_id); onOpenChange(false); }
    catch (error) { setFailure(describeError(error)); }
  }

  return (
    <>
        <DialogHeader><DialogTitle>Tạo vai trò</DialogTitle></DialogHeader>
        <FormError message={failure} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Mã" htmlFor="new-code"><Input id="new-code" className="font-mono uppercase" placeholder="BRANCH_MANAGER" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /></Field>
          <Field label="Tên" htmlFor="new-name"><Input id="new-name" placeholder="Trưởng chi nhánh" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Mô tả" htmlFor="new-desc"><Input id="new-desc" value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        </div>
        <PermissionMatrix permissions={perms.data ?? []} selected={selected} onChange={setSelected} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={submit} disabled={create.isPending}>{create.isPending && <Loader2 className="animate-spin" />}Tạo</Button>
        </DialogFooter>
    </>
  );
}
