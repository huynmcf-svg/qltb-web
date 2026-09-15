'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { EnterpriseSelect } from '@/components/common/enterprise-select';
import { Field } from '@/components/common/field';
import { FormError } from '@/components/common/form-error';
import { useSession } from '@/components/common/session-provider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDevices } from '@/hooks/use-devices';
import { useBranches } from '@/hooks/use-enterprises';
import { useAllocateQuota } from '@/hooks/use-quotas';
import { formatNumber } from '@/lib/utils/date';
import { describeError } from '@/lib/utils/errors';

/** Phân bổ cha → chi nhánh: chọn DN cha, máy cho, chi nhánh, máy nhận, số lượng. */
export function AllocateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">{open && <Body onOpenChange={onOpenChange} />}</DialogContent>
    </Dialog>
  );
}

function Body({ onOpenChange }: { onOpenChange: (o: boolean) => void }) {
  const { user } = useSession();
  const allocate = useAllocateQuota();
  const [from, setFrom] = useState(user?.enterprise_id ?? '');
  const [to, setTo] = useState('');
  const [fromDevice, setFromDevice] = useState('');
  const [toDevice, setToDevice] = useState('');
  const [amount, setAmount] = useState('');
  const [failure, setFailure] = useState<string | null>(null);
  const branches = useBranches(from);
  const fromDevices = useDevices({ enterprise_id: from || undefined, status: 'ACTIVE' });
  const toDevices = useDevices({ enterprise_id: to || undefined });

  async function submit() {
    const n = Number(amount);
    if (!from || !to || !fromDevice || !toDevice) { setFailure('Chọn đủ doanh nghiệp cha, chi nhánh và hai máy.'); return; }
    if (!Number.isInteger(n) || n < 1) { setFailure('Số lượng phải là số nguyên ≥ 1.'); return; }
    try {
      await allocate.mutateAsync({ from_enterprise_id: from, to_enterprise_id: to, from_device_id: fromDevice, device_id: toDevice, amount: n });
      toast.success(`Đã phân bổ ${formatNumber(n)}`); onOpenChange(false);
    } catch (error) { setFailure(describeError(error)); }
  }
  const fromList = fromDevices.data?.pages.flatMap((p) => p.items) ?? [];
  const toList = (toDevices.data?.pages.flatMap((p) => p.items) ?? []).filter((d) => d.status === 'ACTIVE' || d.status === 'LOCKED');

  return (
    <>
        <DialogHeader><DialogTitle>Phân bổ sản lượng xuống chi nhánh</DialogTitle><DialogDescription>Chuyển sản lượng còn lại từ một máy của doanh nghiệp cha sang một máy của chi nhánh.</DialogDescription></DialogHeader>
        <FormError message={failure} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Doanh nghiệp cha">{user?.enterprise_id === null ? <EnterpriseSelect value={from} onChange={(v) => { setFrom(v); setTo(''); setFromDevice(''); }} onlyRoot className="w-full" /> : <Input value={user?.enterprise_name ?? ''} disabled />}</Field>
          <Field label="Chi nhánh nhận">
            <Select value={to} onValueChange={(v) => { setTo(v); setToDevice(''); }} disabled={!from}><SelectTrigger><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger><SelectContent>{branches.data?.map((b) => <SelectItem key={b.enterprise_id} value={b.enterprise_id}>{b.name}</SelectItem>)}</SelectContent></Select>
          </Field>
          <Field label="Máy cho (của DN cha)">
            <Select value={fromDevice} onValueChange={setFromDevice} disabled={!from}><SelectTrigger><SelectValue placeholder="Chọn máy" /></SelectTrigger><SelectContent>{fromList.map((d) => <SelectItem key={d.device_id} value={d.device_id}>{d.serial_number}</SelectItem>)}</SelectContent></Select>
          </Field>
          <Field label="Máy nhận (của chi nhánh)">
            <Select value={toDevice} onValueChange={setToDevice} disabled={!to}><SelectTrigger><SelectValue placeholder="Chọn máy" /></SelectTrigger><SelectContent>{toList.map((d) => <SelectItem key={d.device_id} value={d.device_id}>{d.serial_number}</SelectItem>)}</SelectContent></Select>
          </Field>
          <Field label="Số lượng" htmlFor="alloc-amount"><Input id="alloc-amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={submit} disabled={allocate.isPending}>{allocate.isPending && <Loader2 className="animate-spin" />}Phân bổ</Button>
        </DialogFooter>
    </>
  );
}
