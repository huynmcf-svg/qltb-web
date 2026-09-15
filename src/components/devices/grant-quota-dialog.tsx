'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Field } from '@/components/common/field';
import { FormError } from '@/components/common/form-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGrantQuota } from '@/hooks/use-quotas';
import { formatNumber } from '@/lib/utils/date';
import { describeError } from '@/lib/utils/errors';

export function GrantQuotaDialog({ open, onOpenChange, deviceId, serial, currentTotal }: { open: boolean; onOpenChange: (o: boolean) => void; deviceId: string; serial: string; currentTotal: number }) {
  const grant = useGrantQuota(deviceId);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [failure, setFailure] = useState<string | null>(null);

  async function submit() {
    const n = Number(amount);
    if (!Number.isInteger(n) || n < 1) { setFailure('Số lượng phải là số nguyên ≥ 1.'); return; }
    setFailure(null);
    try {
      await grant.mutateAsync({ amount: n, note: note.trim() || undefined });
      toast.success(`Đã cấp ${formatNumber(n)} cho ${serial}`);
      onOpenChange(false); setAmount(''); setNote('');
    } catch (error) { setFailure(describeError(error)); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cấp sản lượng — {serial}</DialogTitle>
          <DialogDescription>Tổng hiện tại {formatNumber(currentTotal)}. Cấp thêm cộng dồn vào tổng; máy đang khoá vì hết sản lượng sẽ tự mở.</DialogDescription>
        </DialogHeader>
        <FormError message={failure} />
        <div className="space-y-4">
          <Field label="Số lượng" htmlFor="amount"><Input id="amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus placeholder="5000" /></Field>
          <Field label="Ghi chú" htmlFor="note"><Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Gói bổ sung Q4/2026" /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={submit} disabled={grant.isPending}>{grant.isPending && <Loader2 className="animate-spin" />}Cấp</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
