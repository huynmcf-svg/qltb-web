'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { describeError } from '@/lib/utils/errors';
import { FormError } from './form-error';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  /** Bắt nhập lý do — trả về ở `onConfirm(reason)`. */
  reasonLabel?: string;
  onConfirm: (reason: string) => Promise<unknown>;
  successMessage?: string;
}

/** Xác nhận thao tác có hậu quả. Lỗi hiện tại chỗ, không chỉ toast. */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Xác nhận', destructive, reasonLabel, onConfirm, successMessage }: ConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  async function submit() {
    if (reasonLabel && !reason.trim()) { setFailure('Nhập lý do.'); return; }
    setBusy(true); setFailure(null);
    try {
      await onConfirm(reason.trim());
      if (successMessage) toast.success(successMessage);
      onOpenChange(false); setReason('');
    } catch (error) {
      setFailure(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!busy) { onOpenChange(o); setFailure(null); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <FormError message={failure} />
        {reasonLabel && (
          <div className="space-y-2">
            <Label htmlFor="confirm-reason">{reasonLabel}</Label>
            <Textarea id="confirm-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} autoFocus />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Huỷ</Button>
          <Button variant={destructive ? 'destructive' : 'default'} onClick={submit} disabled={busy}>{busy && <Loader2 className="animate-spin" />}{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
