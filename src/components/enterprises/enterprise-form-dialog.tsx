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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCreateEnterprise, useUpdateEnterprise } from '@/hooks/use-enterprises';
import { describeError } from '@/lib/utils/errors';
import type { Enterprise } from '@/types/enterprise';

const schema = z.object({
  code: z.string().regex(/^[A-Z0-9-]{2,32}$/, 'Chữ hoa, số, gạch ngang (2–32 ký tự)'),
  name: z.string().min(1, 'Nhập tên').max(200),
  parent_id: z.string().optional(),
  tax_code: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().regex(/^(\+?[0-9]{8,15})?$/, 'Chỉ số, 8–15 ký tự').optional(),
  email: z.string().email('Email không hợp lệ').or(z.literal('')).optional(),
  contact_name: z.string().max(200).optional(),
  max_users: z.number().int().min(0).max(1000),
});
type Values = z.infer<typeof schema>;
const empty: Values = { code: '', name: '', parent_id: '', tax_code: '', address: '', phone: '', email: '', contact_name: '', max_users: 10 };
const clean = <T extends object>(v: T): T => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === 'string' && x.trim() === '' ? undefined : x])) as T;

export function EnterpriseFormDialog({ open, onOpenChange, enterprise, parentId }: { open: boolean; onOpenChange: (o: boolean) => void; enterprise?: Enterprise; parentId?: string }) {
  const create = useCreateEnterprise();
  const update = useUpdateEnterprise(enterprise?.enterprise_id ?? '');
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (open) form.reset(enterprise ? { ...empty, ...Object.fromEntries(Object.entries(enterprise).map(([k, v]) => [k, v ?? ''])), parent_id: enterprise.parent_id ?? '' } as Values : { ...empty, parent_id: parentId ?? '' });
    setFailure(null);
  }, [open, enterprise, parentId, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFailure(null);
    try {
      const v = clean(values);
      if (enterprise) { await update.mutateAsync({ name: v.name, tax_code: v.tax_code, address: v.address, phone: v.phone, email: v.email, contact_name: v.contact_name, max_users: v.max_users }); toast.success('Đã cập nhật doanh nghiệp'); }
      else { await create.mutateAsync(v); toast.success('Đã tạo doanh nghiệp'); }
      onOpenChange(false);
    } catch (error) { setFailure(describeError(error)); }
  });
  const e = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle>{enterprise ? `Sửa ${enterprise.name}` : parentId ? 'Thêm chi nhánh' : 'Thêm doanh nghiệp'}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormError message={failure} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mã" htmlFor="code" error={e.code?.message} hint={enterprise ? 'Không đổi được' : undefined}><Input id="code" placeholder="VPCC-DA" disabled={!!enterprise} className="font-mono uppercase" {...form.register('code', { setValueAs: (v: string) => v.toUpperCase() })} /></Field>
            <Field label="Tên" htmlFor="name" error={e.name?.message}><Input id="name" placeholder="VPCC Đông Anh" {...form.register('name')} /></Field>
            {!enterprise && (
              <Field label="Thuộc doanh nghiệp" hint="Để trống = doanh nghiệp gốc. Tối đa 2 cấp.">
                <EnterpriseSelect value={form.watch('parent_id') ?? ''} onChange={(v) => form.setValue('parent_id', v)} allowAll onlyRoot className="w-full" placeholder="Doanh nghiệp gốc" />
              </Field>
            )}
            <Field label="Mã số thuế" htmlFor="tax_code"><Input id="tax_code" {...form.register('tax_code')} /></Field>
            <Field label="Người liên hệ" htmlFor="contact_name"><Input id="contact_name" {...form.register('contact_name')} /></Field>
            <Field label="Điện thoại" htmlFor="phone" error={e.phone?.message}><Input id="phone" placeholder="+84243xxxxxxx" {...form.register('phone')} /></Field>
            <Field label="Email" htmlFor="email" error={e.email?.message}><Input id="email" type="email" {...form.register('email')} /></Field>
            <Field label="Hạn mức tài khoản" htmlFor="max_users" error={e.max_users?.message} hint="Chỉ quản trị hệ thống đổi được"><Input id="max_users" type="number" min={0} max={1000} {...form.register('max_users', { valueAsNumber: true })} /></Field>
          </div>
          <Field label="Địa chỉ" htmlFor="address"><Input id="address" {...form.register('address')} /></Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="animate-spin" />}{enterprise ? 'Lưu' : 'Tạo'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
