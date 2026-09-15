'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { EnterpriseSelect } from '@/components/common/enterprise-select';
import { Field } from '@/components/common/field';
import { FormError } from '@/components/common/form-error';
import { SecretReveal } from '@/components/common/secret-reveal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAssignDevice } from '@/hooks/use-devices';
import { todayYmd } from '@/lib/utils/date';
import { describeError } from '@/lib/utils/errors';

/** Gán máy cho DN. Sau khi gán hiện API key MỘT LẦN — hộp thoại không tự đóng. */
export function AssignDialog({ open, onOpenChange, deviceId, serial }: { open: boolean; onOpenChange: (o: boolean) => void; deviceId: string; serial: string }) {
  const assign = useAssignDevice(deviceId);
  const [enterprise, setEnterprise] = useState('');
  const [soldAt, setSoldAt] = useState(todayYmd());
  const [months, setMonths] = useState('12');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  function close() { onOpenChange(false); setApiKey(null); setFailure(null); setEnterprise(''); }

  async function submit() {
    if (!enterprise) { setFailure('Chọn doanh nghiệp.'); return; }
    setFailure(null);
    try {
      const r = await assign.mutateAsync({ enterprise_id: enterprise, sold_at: soldAt, warranty_months: Number(months) });
      setApiKey(r.api_key);
      toast.success(`Đã gán ${serial}`);
    } catch (error) { setFailure(describeError(error)); }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gán {serial} cho doanh nghiệp</DialogTitle>
          <DialogDescription>Máy chuyển sang Đang hoạt động, tạo bảo hành từ ngày bán và cấp API key để máy gửi lượt dùng.</DialogDescription>
        </DialogHeader>
        {apiKey ? (
          <>
            <SecretReveal label="API key của thiết bị" value={apiKey} hint="Nạp key này vào máy (header X-Device-Key). Chỉ hiện một lần — mất thì cấp lại ở menu thiết bị, key cũ sẽ chết." />
            <DialogFooter><Button onClick={close}>Đã lưu key, đóng</Button></DialogFooter>
          </>
        ) : (
          <>
            <FormError message={failure} />
            <div className="space-y-4">
              <Field label="Doanh nghiệp"><EnterpriseSelect value={enterprise} onChange={setEnterprise} className="w-full" /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ngày bán" htmlFor="sold_at"><Input id="sold_at" type="date" value={soldAt} onChange={(e) => setSoldAt(e.target.value)} /></Field>
                <Field label="Bảo hành (tháng)" htmlFor="months" hint="0 = không tạo bảo hành"><Input id="months" type="number" min={0} max={120} value={months} onChange={(e) => setMonths(e.target.value)} /></Field>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={close}>Huỷ</Button>
              <Button onClick={submit} disabled={assign.isPending}>{assign.isPending && <Loader2 className="animate-spin" />}Gán máy</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
