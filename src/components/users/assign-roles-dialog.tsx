'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FormError } from '@/components/common/form-error';
import { useSession } from '@/components/common/session-provider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAssignRoles, useRoles } from '@/hooks/use-users';
import { describeError } from '@/lib/utils/errors';
import type { User } from '@/types/user';

/** Radix unmount nội dung khi đóng → state của `Body` tự khởi tạo lại mỗi lần mở, không cần effect. */
export function AssignRolesDialog({ open, onOpenChange, user }: { open: boolean; onOpenChange: (o: boolean) => void; user: User | null }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">{user && <Body user={user} onOpenChange={onOpenChange} />}</DialogContent>
    </Dialog>
  );
}

function Body({ user, onOpenChange }: { user: User; onOpenChange: (o: boolean) => void }) {
  const { user: me } = useSession();
  const roles = useRoles();
  const assign = useAssignRoles();
  const [selected, setSelected] = useState<string[]>(() => user.roles.map((r) => r.role_id));
  const [failure, setFailure] = useState<string | null>(null);

  async function submit() {
    if (!selected.length) { setFailure('Chọn ít nhất một vai trò.'); return; }
    try { await assign.mutateAsync({ id: user.user_id, role_ids: selected }); toast.success('Đã cập nhật vai trò'); onOpenChange(false); }
    catch (error) { setFailure(describeError(error)); }
  }

  return (
    <>
        <DialogHeader><DialogTitle>Vai trò của {user.full_name}</DialogTitle><DialogDescription>Thay thế toàn bộ vai trò hiện có. Có hiệu lực ngay.</DialogDescription></DialogHeader>
        <FormError message={failure} />
        <div className="space-y-2">
          {(roles.data ?? []).filter((r) => me?.enterprise_id === null || r.code !== 'SYSTEM_ADMIN').map((r) => (
            <label key={r.role_id} className="flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-sm hover:bg-accent">
              <Checkbox checked={selected.includes(r.role_id)} onCheckedChange={(c) => setSelected(c ? [...selected, r.role_id] : selected.filter((id) => id !== r.role_id))} className="mt-0.5" />
              <span><span className="font-medium">{r.name}</span> <span className="font-mono text-xs text-muted-foreground">{r.code}</span><span className="block text-xs text-muted-foreground">{r.description}</span></span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={submit} disabled={assign.isPending}>{assign.isPending && <Loader2 className="animate-spin" />}Lưu</Button>
        </DialogFooter>
    </>
  );
}
