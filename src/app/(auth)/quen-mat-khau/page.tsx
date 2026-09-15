'use client';

import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { BrandMark } from '@/components/common/brand-mark';
import { Field } from '@/components/common/field';
import { FormError } from '@/components/common/form-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api/client';
import { describeError } from '@/lib/utils/errors';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) { setFailure('Nhập tên đăng nhập hoặc email.'); return; }
    setBusy(true); setFailure(null);
    try { await apiFetch<null>('/auth/forgot-password', { method: 'POST', body: { identifier: identifier.trim() }, skipRefresh: true }); setDone(true); }
    catch (err) { setFailure(describeError(err)); }
    finally { setBusy(false); }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3"><BrandMark className="size-10" /><div className="font-semibold">Quên mật khẩu</div></div>
        {done ? (
          <div className="rounded-lg border bg-card p-5 text-sm">
            <MailCheck className="mb-2 size-6 text-success" />
            <p>Nếu tài khoản tồn tại, mã đặt lại đã được tạo (hạn 30 phút). Hiện chưa có kênh gửi email — liên hệ quản trị viên để nhận mã, rồi vào <Link href="/dat-lai-mat-khau" className="font-medium text-primary underline">đặt lại mật khẩu</Link>.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <FormError message={failure} />
            <Field label="Tên đăng nhập hoặc email" htmlFor="identifier"><Input id="identifier" autoFocus value={identifier} onChange={(e) => setIdentifier(e.target.value)} /></Field>
            <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Gửi yêu cầu</Button>
          </form>
        )}
        <Link href="/login" className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Về đăng nhập</Link>
      </div>
    </main>
  );
}
