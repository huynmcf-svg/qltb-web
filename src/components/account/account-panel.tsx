'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Field } from '@/components/common/field';
import { FormError } from '@/components/common/form-error';
import { PasswordInput } from '@/components/common/password-input';
import { useSession } from '@/components/common/session-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authApi } from '@/lib/api/auth';
import { patchCurrentUser } from '@/lib/auth/session';
import { describeError } from '@/lib/utils/errors';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Nhập họ tên').max(200),
  email: z.string().email('Email không hợp lệ').or(z.literal('')).optional(),
  phone: z.string().regex(/^(\+?[0-9]{8,15})?$/, 'Chỉ số, 8–15 ký tự').optional(),
});
const passwordSchema = z.object({
  current_password: z.string().min(1, 'Nhập mật khẩu hiện tại'),
  new_password: z.string().min(8, 'Tối thiểu 8 ký tự'),
  confirm: z.string(),
}).refine((v) => v.new_password === v.confirm, { path: ['confirm'], message: 'Hai lần nhập chưa khớp' });

export function AccountPanel() {
  const { user } = useSession();
  const tab = useSearchParams().get('tab') === 'mat-khau' ? 'password' : 'profile';
  return (
    <Tabs defaultValue={tab}>
      <TabsList><TabsTrigger value="profile">Hồ sơ</TabsTrigger><TabsTrigger value="password">Đổi mật khẩu</TabsTrigger></TabsList>
      <TabsContent value="profile"><ProfileCard /></TabsContent>
      <TabsContent value="password"><PasswordCard mustChange={!!user?.must_change_password} /></TabsContent>
    </Tabs>
  );
}

function ProfileCard() {
  const { user } = useSession();
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: { full_name: user?.full_name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' } });
  const onSubmit = form.handleSubmit(async (v) => {
    setFailure(null);
    try {
      const r = await authApi.updateProfile({ full_name: v.full_name, email: v.email || undefined, phone: v.phone || undefined });
      patchCurrentUser(r); toast.success('Đã cập nhật hồ sơ');
    } catch (e) { setFailure(describeError(e)); }
  });
  const e = form.formState.errors;
  return (
    <Card className="max-w-xl">
      <CardHeader><CardTitle>Hồ sơ cá nhân</CardTitle><CardDescription>@{user?.username} · {user?.roles.join(', ')}{user?.enterprise_name ? ` · ${user.enterprise_name}` : ''}</CardDescription></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormError message={failure} />
          <Field label="Họ tên" htmlFor="full_name" error={e.full_name?.message}><Input id="full_name" {...form.register('full_name')} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" htmlFor="email" error={e.email?.message}><Input id="email" type="email" {...form.register('email')} /></Field>
            <Field label="Điện thoại" htmlFor="phone" error={e.phone?.message}><Input id="phone" {...form.register('phone')} /></Field>
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="animate-spin" />}Lưu</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordCard({ mustChange }: { mustChange: boolean }) {
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), defaultValues: { current_password: '', new_password: '', confirm: '' } });
  const onSubmit = form.handleSubmit(async (v) => {
    setFailure(null);
    try {
      await authApi.changePassword({ current_password: v.current_password, new_password: v.new_password });
      patchCurrentUser({ must_change_password: false }); form.reset(); toast.success('Đã đổi mật khẩu. Các thiết bị khác phải đăng nhập lại.');
    } catch (e) { setFailure(describeError(e)); }
  });
  const e = form.formState.errors;
  return (
    <Card className="max-w-xl">
      <CardHeader><CardTitle>Đổi mật khẩu</CardTitle><CardDescription>{mustChange ? 'Bạn đang dùng mật khẩu tạm — hãy đổi ngay.' : 'Đổi xong, mọi phiên đăng nhập khác bị huỷ.'}</CardDescription></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormError message={failure} />
          <Field label="Mật khẩu hiện tại" htmlFor="current" error={e.current_password?.message}><PasswordInput id="current" autoComplete="current-password" {...form.register('current_password')} /></Field>
          <Field label="Mật khẩu mới" htmlFor="new" error={e.new_password?.message} hint="Tối thiểu 8 ký tự"><PasswordInput id="new" autoComplete="new-password" {...form.register('new_password')} /></Field>
          <Field label="Nhập lại mật khẩu mới" htmlFor="confirm" error={e.confirm?.message}><PasswordInput id="confirm" autoComplete="new-password" {...form.register('confirm')} /></Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="animate-spin" />}Đổi mật khẩu</Button>
        </form>
      </CardContent>
    </Card>
  );
}
