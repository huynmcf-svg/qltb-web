'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { EnterpriseSelect } from '@/components/common/enterprise-select';
import { Field } from '@/components/common/field';
import { FormError } from '@/components/common/form-error';
import { SecretReveal } from '@/components/common/secret-reveal';
import { useSession } from '@/components/common/session-provider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCreateUser, useRoles, useUpdateUser } from '@/hooks/use-users';
import { describeError } from '@/lib/utils/errors';
import type { User } from '@/types/user';

const schema = z.object({
  username: z.string().regex(/^[a-z0-9._-]{3,50}$/, 'Chữ thường, số, dấu chấm, gạch (3–50 ký tự)'),
  full_name: z.string().min(1, 'Nhập họ tên').max(200),
  email: z.string().email('Email không hợp lệ').or(z.literal('')).optional(),
  phone: z.string().regex(/^(\+?[0-9]{8,15})?$/, 'Chỉ số, 8–15 ký tự').optional(),
  enterprise_id: z.string().optional(),
  role_ids: z.array(z.string()).min(1, 'Chọn ít nhất một vai trò'),
  password: z.string().min(8, 'Tối thiểu 8 ký tự').or(z.literal('')).optional(),
});
type Values = z.infer<typeof schema>;
const clean = <T extends object>(v: T): T => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === 'string' && x.trim() === '' ? undefined : x])) as T;

export function UserFormDialog({ open, onOpenChange, user, enterpriseId }: { open: boolean; onOpenChange: (o: boolean) => void; user?: User; enterpriseId?: string }) {
  const { user: me } = useSession();
  const isAdmin = me?.enterprise_id === null;
  const roles = useRoles();
  const create = useCreateUser();
  const update = useUpdateUser();
  const [failure, setFailure] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { username: '', full_name: '', email: '', phone: '', enterprise_id: '', role_ids: [], password: '' } });

  useEffect(() => {
    if (open) form.reset(user ? { username: user.username, full_name: user.full_name, email: user.email ?? '', phone: user.phone ?? '', enterprise_id: user.enterprise_id ?? '', role_ids: user.roles.map((r) => r.role_id), password: '' } : { username: '', full_name: '', email: '', phone: '', enterprise_id: enterpriseId ?? me?.enterprise_id ?? '', role_ids: [], password: '' });
    setFailure(null); setTempPassword(null);
  }, [open, user, enterpriseId, me, form]);

  function close() { onOpenChange(false); setTempPassword(null); }

  const onSubmit = form.handleSubmit(async (values) => {
    setFailure(null);
    try {
      const v = clean(values);
      if (user) { await update.mutateAsync({ id: user.user_id, input: { full_name: v.full_name, email: v.email, phone: v.phone } }); toast.success('Đã cập nhật người dùng'); close(); return; }
      const r = await create.mutateAsync({ ...v, enterprise_id: v.enterprise_id || undefined });
      toast.success(`Đã tạo tài khoản ${r.username}`);
      if (r.temporary_password) setTempPassword(r.temporary_password); else close();
    } catch (error) { setFailure(describeError(error)); }
  });
  const e = form.formState.errors;
  const selected = form.watch('role_ids');
  const visibleRoles = (roles.data ?? []).filter((r) => isAdmin || r.code !== 'SYSTEM_ADMIN');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{user ? `Sửa ${user.username}` : 'Tạo tài khoản'}</DialogTitle></DialogHeader>
        {tempPassword ? (
          <>
            <SecretReveal label="Mật khẩu tạm" value={tempPassword} hint="Gửi cho người dùng. Họ bắt buộc đổi mật khẩu ở lần đăng nhập đầu. Chỉ hiện một lần." />
            <DialogFooter><Button onClick={close}>Đóng</Button></DialogFooter>
          </>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormError message={failure} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tên đăng nhập" htmlFor="username" error={e.username?.message} hint={user ? 'Không đổi được' : undefined}><Input id="username" disabled={!!user} className="font-mono" placeholder="ketoan.dongdanh" {...form.register('username')} /></Field>
              <Field label="Họ tên" htmlFor="full_name" error={e.full_name?.message}><Input id="full_name" {...form.register('full_name')} /></Field>
              <Field label="Email" htmlFor="email" error={e.email?.message}><Input id="email" type="email" {...form.register('email')} /></Field>
              <Field label="Điện thoại" htmlFor="phone" error={e.phone?.message}><Input id="phone" placeholder="+84912345678" {...form.register('phone')} /></Field>
              {!user && isAdmin && (
                <Field label="Doanh nghiệp" hint="Để trống = quản trị hệ thống">
                  <EnterpriseSelect value={form.watch('enterprise_id') ?? ''} onChange={(v) => form.setValue('enterprise_id', v)} allowAll className="w-full" placeholder="Quản trị hệ thống" />
                </Field>
              )}
              {!user && <Field label="Mật khẩu" htmlFor="password" error={e.password?.message} hint="Để trống thì hệ thống sinh và hiện một lần"><Input id="password" type="password" autoComplete="new-password" {...form.register('password')} /></Field>}
            </div>
            {!user && (
              <Field label="Vai trò" error={e.role_ids?.message}>
                <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                  {visibleRoles.map((r) => (
                    <label key={r.role_id} className="flex cursor-pointer items-start gap-2 text-sm">
                      <Checkbox checked={selected.includes(r.role_id)} onCheckedChange={(c) => form.setValue('role_ids', c ? [...selected, r.role_id] : selected.filter((id) => id !== r.role_id), { shouldValidate: true })} className="mt-0.5" />
                      <span><span className="font-medium">{r.name}</span><span className="block text-xs text-muted-foreground">{r.description}</span></span>
                    </label>
                  ))}
                </div>
              </Field>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>Huỷ</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="animate-spin" />}{user ? 'Lưu' : 'Tạo'}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
