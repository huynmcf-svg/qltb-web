'use client';

import { CalendarPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable, type Column } from '@/components/common/data-table';
import { Field } from '@/components/common/field';
import { FilterBar, SearchInput } from '@/components/common/filter-bar';
import { FormError } from '@/components/common/form-error';
import { useSession } from '@/components/common/session-provider';
import { WARRANTY_STATUS_LABEL, WarrantyStatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounced } from '@/hooks/use-debounced';
import { useExtendWarranty, useWarranties } from '@/hooks/use-misc';
import { formatDate } from '@/lib/utils/date';
import { describeError } from '@/lib/utils/errors';
import type { WarrantyStatus } from '@/types/device';
import type { WarrantyRow } from '@/types/warranty';

const ALL = '__all__';

export function WarrantyTable() {
  const { can, user } = useSession();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [within, setWithin] = useState('');
  const [extending, setExtending] = useState<WarrantyRow | null>(null);
  const query = useWarranties({ q: useDebounced(q, 300) || undefined, status: (status || undefined) as WarrantyStatus | undefined, expiring_within_days: within ? Number(within) : undefined });
  const rows = query.data?.pages.flatMap((p) => p.items) ?? [];

  const columns: Column<WarrantyRow>[] = [
    { key: 'serial', header: 'Thiết bị', cell: (w) => <Link href={`/thiet-bi/${w.device_id}`} className="font-mono text-[13px] font-medium text-primary hover:underline">{w.serial_number}</Link> },
    { key: 'ent', header: 'Doanh nghiệp', cell: (w) => w.enterprise_name ?? '—' },
    { key: 'range', header: 'Hiệu lực', className: 'tabular', cell: (w) => `${formatDate(w.start_date)} → ${formatDate(w.end_date)}` },
    { key: 'days', header: 'Còn lại', className: 'tabular', cell: (w) => (w.status !== 'ACTIVE' ? '—' : <span className={w.days_remaining <= 7 ? 'font-medium text-danger' : w.days_remaining <= 30 ? 'text-warning-foreground' : ''}>{w.days_remaining < 0 ? `quá ${-w.days_remaining} ngày` : `${w.days_remaining} ngày`}</span>) },
    { key: 'status', header: 'Trạng thái', cell: (w) => <WarrantyStatusBadge status={w.status} /> },
    { key: 'source', header: 'Nguồn', cell: (w) => ({ SALE: 'Bán máy', EXCHANGE: 'Đổi trả', EXTENSION: 'Gia hạn' })[w.source] },
    { key: 'act', header: '', className: 'w-10', cell: (w) => (user?.enterprise_id === null && can('warranty.manage') && w.status === 'ACTIVE' ? <Button variant="ghost" size="icon-sm" onClick={() => setExtending(w)} aria-label="Gia hạn"><CalendarPlus /></Button> : null) },
  ];

  return (
    <>
      <FilterBar>
        <SearchInput value={q} onChange={setQ} placeholder="Serial, tên máy…" />
        <Select value={status || ALL} onValueChange={(v) => setStatus(v === ALL ? '' : v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Mọi trạng thái</SelectItem>{(Object.keys(WARRANTY_STATUS_LABEL) as WarrantyStatus[]).map((s) => <SelectItem key={s} value={s}>{WARRANTY_STATUS_LABEL[s]}</SelectItem>)}</SelectContent></Select>
        <Select value={within || ALL} onValueChange={(v) => setWithin(v === ALL ? '' : v)}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Mọi thời hạn</SelectItem><SelectItem value="30">Còn ≤ 30 ngày</SelectItem><SelectItem value="15">Còn ≤ 15 ngày</SelectItem><SelectItem value="7">Còn ≤ 7 ngày</SelectItem></SelectContent></Select>
      </FilterBar>
      <DataTable columns={columns} rows={rows} rowKey={(w) => w.warranty_id} isPending={query.isPending} error={query.error} hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} onLoadMore={() => query.fetchNextPage()} />
      <ExtendDialog warranty={extending} onClose={() => setExtending(null)} />
    </>
  );
}

function ExtendDialog({ warranty, onClose }: { warranty: WarrantyRow | null; onClose: () => void }) {
  return (
    <Dialog open={!!warranty} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">{warranty && <ExtendBody warranty={warranty} onClose={onClose} />}</DialogContent>
    </Dialog>
  );
}

function ExtendBody({ warranty, onClose }: { warranty: WarrantyRow; onClose: () => void }) {
  const extend = useExtendWarranty();
  const [end, setEnd] = useState(warranty.end_date);
  const [notes, setNotes] = useState(warranty.notes ?? '');
  const [failure, setFailure] = useState<string | null>(null);
  async function submit() {
    if (end < warranty.end_date) { setFailure('Chỉ dời ngày hết hạn về sau.'); return; }
    try { await extend.mutateAsync({ id: warranty.warranty_id, end_date: end, notes: notes || undefined }); toast.success('Đã gia hạn'); onClose(); }
    catch (error) { setFailure(describeError(error)); }
  }
  return (
    <>
      <DialogHeader><DialogTitle>Gia hạn bảo hành {warranty.serial_number}</DialogTitle></DialogHeader>
      <FormError message={failure} />
      <Field label="Hết hạn mới" htmlFor="end" hint={`Hiện tại: ${formatDate(warranty.end_date)}`}><Input id="end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
      <Field label="Ghi chú" htmlFor="wnotes"><Input id="wnotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Theo phụ lục HĐ 02" /></Field>
      <DialogFooter><Button variant="outline" onClick={onClose}>Huỷ</Button><Button onClick={submit} disabled={extend.isPending}>{extend.isPending && <Loader2 className="animate-spin" />}Gia hạn</Button></DialogFooter>
    </>
  );
}
