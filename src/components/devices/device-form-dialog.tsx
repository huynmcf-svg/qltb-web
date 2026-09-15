'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Field } from '@/components/common/field';
import { FormError } from '@/components/common/form-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateDevice, useDeviceTypes, useUpdateDevice } from '@/hooks/use-devices';
import { describeError } from '@/lib/utils/errors';
import type { Device } from '@/types/device';

const schema = z.object({
  serial_number: z.string().regex(/^[A-Z0-9-]{4,64}$/, 'Chữ hoa, số, gạch ngang (4–64 ký tự)'),
  device_type: z.string().min(1, 'Chọn loại thiết bị'),
  model: z.string().max(100).optional(),
  name: z.string().max(200).optional(),
  firmware_version: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});
type Values = z.infer<typeof schema>;

/** Chuỗi rỗng → undefined để không gửi field trống lên server. */
const clean = (v: Values): Values => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === 'string' && x.trim() === '' ? undefined : x])) as Values;

/** Tạo (không có `device`) hoặc sửa hồ sơ (có `device` — serial và loại khoá). */
export function DeviceFormDialog({ open, onOpenChange, device }: { open: boolean; onOpenChange: (o: boolean) => void; device?: Device }) {
  const types = useDeviceTypes();
  const create = useCreateDevice();
  const update = useUpdateDevice(device?.device_id ?? '');
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { serial_number: '', device_type: '', model: '', name: '', firmware_version: '', notes: '' } });

  useEffect(() => {
    if (open) form.reset(device ? { serial_number: device.serial_number, device_type: device.device_type, model: device.model ?? '', name: device.name ?? '', firmware_version: device.firmware_version ?? '', notes: device.notes ?? '' } : { serial_number: '', device_type: '', model: '', name: '', firmware_version: '', notes: '' });
    setFailure(null);
  }, [open, device, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFailure(null);
    try {
      const v = clean(values);
      if (device) { await update.mutateAsync({ model: v.model, name: v.name, firmware_version: v.firmware_version, notes: v.notes }); toast.success('Đã cập nhật thiết bị'); }
      else { await create.mutateAsync(v); toast.success('Đã nhập thiết bị vào kho'); }
      onOpenChange(false);
    } catch (error) { setFailure(describeError(error)); }
  });
  const e = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{device ? `Sửa ${device.serial_number}` : 'Nhập thiết bị vào kho'}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormError message={failure} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Serial" htmlFor="serial_number" error={e.serial_number?.message} hint={device ? 'Không đổi được' : undefined}>
              <Input id="serial_number" placeholder="QLTB-24-000123" disabled={!!device} className="font-mono uppercase" {...form.register('serial_number', { setValueAs: (v: string) => v.toUpperCase() })} />
            </Field>
            <Field label="Loại thiết bị" error={e.device_type?.message}>
              <Select value={form.watch('device_type')} onValueChange={(v) => form.setValue('device_type', v, { shouldValidate: true })} disabled={!!device}>
                <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                <SelectContent>{types.data?.items.map((t) => <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Model" htmlFor="model"><Input id="model" placeholder="SP-200" {...form.register('model')} /></Field>
            <Field label="Tên gợi nhớ" htmlFor="name"><Input id="name" placeholder="Máy ký số quầy 1" {...form.register('name')} /></Field>
            <Field label="Firmware" htmlFor="firmware_version"><Input id="firmware_version" placeholder="1.4.2" {...form.register('firmware_version')} /></Field>
          </div>
          <Field label="Ghi chú" htmlFor="notes"><Textarea id="notes" rows={2} {...form.register('notes')} /></Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="animate-spin" />}{device ? 'Lưu' : 'Nhập kho'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
