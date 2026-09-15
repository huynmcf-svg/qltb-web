'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

/** Hiện một bí mật (API key, mật khẩu tạm) MỘT LẦN kèm nút copy. */
export function SecretReveal({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
      <div className="text-xs font-medium text-warning-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 break-all rounded bg-background px-2 py-1.5 font-mono text-sm">{value}</code>
        <Button size="icon-sm" variant="outline" onClick={copy} aria-label="Sao chép">{copied ? <Check /> : <Copy />}</Button>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{hint ?? 'Chỉ hiện một lần — sao chép và cất ngay. Đóng hộp thoại là không xem lại được.'}</p>
    </div>
  );
}
