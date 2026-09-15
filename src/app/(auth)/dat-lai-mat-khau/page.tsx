'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { BrandMark } from '@/components/common/brand-mark';
import { Field } from '@/components/common/field';
import { FormError } from '@/components/common/form-error';
import { PasswordInput } from '@/components/common/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api/client';
import { describeError } from '@/lib/utils/errors';

function ResetForm() {
  const router = useRouter();
  const [token, setToken] = useState(useSearchParams().get('token') ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) { setFailure('Nhập mã đặt lại.'); return; }
    if (password.length < 8) { setFailure('Mật khẩu tối thiểu 8 ký tự.'); return; }
    if (password !== confirm) { setFailure('Hai lần nhập chưa khớp.'); return; }
    setBusy(true); setFailure(null);
    try { await apiFetch<null>('/auth/reset-password', { method: 'POST', body: { token: token.trim(), new_password: password }, skipRefresh: true }); toast.success('Đã đặt lại mật khẩu, đăng nhập lại.'); router.replace('/login'); }
    catch (err) { setFailure(describeError(err)); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <FormError message={failure} />
      <Field label="Mã đặt lại" htmlFor="token"><Input id="token" value={token} onChange={(e) => setToken(e.target.value)} className="font-mono" /></Field>
      <Field label="Mật khẩu mới" htmlFor="pw"><PasswordInput id="pw" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></Field>
      <Field label="Nhập lại" htmlFor="pw2"><PasswordInput id="pw2" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" /></Field>
      <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Đặt lại mật khẩu</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3"><BrandMark className="size-10" /><div className="font-semibold">Đặt lại mật khẩu</div></div>
        <Suspense><ResetForm /></Suspense>
        <Link href="/login" className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Về đăng nhập</Link>
      </div>
    </main>
  );
}
