'use client';

import { Check, Loader2, MoreHorizontal, Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DataTable, type Column } from '@/components/common/data-table';
import { Field } from '@/components/common/field';
import { FilterBar } from '@/components/common/filter-bar';
import { FormError } from '@/components/common/form-error';
import { SecretReveal } from '@/components/common/secret-reveal';
import { useSession } from '@/components/common/session-provider';
import { EXCHANGE_STATUS_LABEL, ExchangeStatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDevices } from '@/hooks/use-devices';
import { useApproveExchange, useCreateExchange, useDeleteExchange, useExchanges, useRejectExchange } from '@/hooks/use-misc';
import { formatDateTime } from '@/lib/utils/date';
import { describeError } from '@/lib/utils/errors';
import type { DeviceExchange, ExchangeStatus } from '@/types/exchange';

const ALL = '__all__';
type Modal = null | { kind: 'create' } | { kind: 'approve' | 'reject' | 'delete'; x: DeviceExchange };

export function ExchangeTable() {
  const { can, user } = useSession();
  const isAdmin = user?.enterprise_id === null;
  const [status, setStatus] = useState('PENDING');
  const [modal, setModal] = useState<Modal>(null);
  const query = useExchanges({ status: (status || undefined) as ExchangeStatus | undefined });
  const reject = useRejectExchange();
  const del = useDeleteExchange();
  const rows = query.data?.pages.flatMap((p) => p.items) ?? [];

  const columns: Column<DeviceExchange>[] = [
    { key: 'at', header: 'Ngày gửi', className: 'tabular', cell: (x) => formatDateTime(x.requested_at) },
    { key: 'ent', header: 'Doanh nghiệp', cell: (x) => x.enterprise_name },
    { key: 'old', header: 'Máy cũ', cell: (x) => <Link href={`/thiet-bi/${x.old_device_id}`} className="font-mono text-[13px] text-primary hover:underline">{x.old_serial_number}</Link> },
    { key: 'new', header: 'Máy mới', cell: (x) => (x.new_device_id ? <Link href={`/thiet-bi/${x.new_device_id}`} className="font-mono text-[13px] text-primary hover:underline">{x.new_serial_number}</Link> : <span className="text-muted-foreground">—</span>) },
    { key: 'reason', header: 'Lý do', className: 'max-w-[18rem]', cell: (x) => <div className="line-clamp-2">{x.reason}{x.reject_reason && <div className="text-xs text-danger">Từ chối: {x.reject_reason}</div>}</div> },
    { key: 'status', header: 'Trạng thái', cell: (x) => <ExchangeStatusBadge status={x.status} /> },
    { key: 'by', header: 'Người gửi / duyệt', cell: (x) => <div className="text-xs">{x.requested_by_name}{x.approved_by_name && <div className="text-muted-foreground">→ {x.approved_by_name}</div>}</div> },
    {
      key: 'act', header: '', className: 'w-10', cell: (x) => x.status === 'PENDING' ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Thao tác"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAdmin && can('exchange.approve') && <DropdownMenuItem onClick={() => setModal({ kind: 'approve', x })}><Check />Duyệt, gán máy mới</DropdownMenuItem>}
            {isAdmin && can('exchange.approve') && <DropdownMenuItem onClick={() => setModal({ kind: 'reject', x })}><X />Từ chối</DropdownMenuItem>}
            {can('exchange.request') && (isAdmin || x.requested_by === user?.user_id) && <DropdownMenuItem variant="destructive" onClick={() => setModal({ kind: 'delete', x })}><Trash2 />Xoá yêu cầu</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null,
    },
  ];
  const m = modal && 'x' in modal ? modal.x : null;

  return (
    <>
      <FilterBar>
        <Select value={status || ALL} onValueChange={(v) => setStatus(v === ALL ? '' : v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Mọi trạng thái</SelectItem>{(Object.keys(EXCHANGE_STATUS_LABEL) as ExchangeStatus[]).map((s) => <SelectItem key={s} value={s}>{EXCHANGE_STATUS_LABEL[s]}</SelectItem>)}</SelectContent></Select>
        <div className="ml-auto">{can('exchange.request') && <Button onClick={() => setModal({ kind: 'create' })}><Plus />Tạo yêu cầu đổi trả</Button>}</div>
      </FilterBar>
      <DataTable columns={columns} rows={rows} rowKey={(x) => x.exchange_id} isPending={query.isPending} error={query.error} emptyText="Không có yêu cầu nào." hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} onLoadMore={() => query.fetchNextPage()} />
      <CreateExchangeDialog open={modal?.kind === 'create'} onOpenChange={(o) => !o && setModal(null)} />
      <ApproveDialog exchange={modal?.kind === 'approve' ? modal.x : null} onClose={() => setModal(null)} />
      <ConfirmDialog open={modal?.kind === 'reject'} onOpenChange={(o) => !o && setModal(null)} title={`Từ chối đổi trả ${m?.old_serial_number}`} reasonLabel="Lý do từ chối" confirmLabel="Từ chối" destructive onConfirm={(reason) => reject.mutateAsync({ id: m!.exchange_id, reject_reason: reason })} successMessage="Đã từ chối" />
      <ConfirmDialog open={modal?.kind === 'delete'} onOpenChange={(o) => !o && setModal(null)} title="Xoá yêu cầu đổi trả" confirmLabel="Xoá" destructive onConfirm={() => del.mutateAsync(m!.exchange_id)} successMessage="Đã xoá" />
    </>
  );
}

function CreateExchangeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">{open && <CreateBody onOpenChange={onOpenChange} />}</DialogContent>
    </Dialog>
  );
}

function CreateBody({ onOpenChange }: { onOpenChange: (o: boolean) => void }) {
  const create = useCreateExchange();
  const devices = useDevices({ status: 'ACTIVE' });
  const locked = useDevices({ status: 'LOCKED' });
  const [device, setDevice] = useState('');
  const [reason, setReason] = useState('');
  const [failure, setFailure] = useState<string | null>(null);
  const list = [...(devices.data?.pages.flatMap((p) => p.items) ?? []), ...(locked.data?.pages.flatMap((p) => p.items) ?? [])];
  async function submit() {
    if (!device) { setFailure('Chọn máy cần đổi.'); return; }
    if (!reason.trim()) { setFailure('Nhập lý do.'); return; }
    try { await create.mutateAsync({ old_device_id: device, reason: reason.trim() }); toast.success('Đã gửi yêu cầu đổi trả'); onOpenChange(false); }
    catch (error) { setFailure(describeError(error)); }
  }
  return (
    <>
        <DialogHeader><DialogTitle>Yêu cầu đổi trả máy</DialogTitle><DialogDescription>Chọn máy đang dùng bị lỗi. Quản trị hệ thống sẽ duyệt và gán máy mới; bảo hành và sản lượng còn lại chuyển sang máy mới.</DialogDescription></DialogHeader>
        <FormError message={failure} />
        <Field label="Máy cần đổi"><Select value={device} onValueChange={setDevice}><SelectTrigger><SelectValue placeholder="Chọn máy" /></SelectTrigger><SelectContent>{list.map((d) => <SelectItem key={d.device_id} value={d.device_id}>{d.serial_number}{d.enterprise_name ? ` · ${d.enterprise_name}` : ''}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Lý do" htmlFor="reason"><Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Màn hình cảm ứng liệt…" /></Field>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button><Button onClick={submit} disabled={create.isPending}>{create.isPending && <Loader2 className="animate-spin" />}Gửi yêu cầu</Button></DialogFooter>
    </>
  );
}

function ApproveDialog({ exchange, onClose }: { exchange: DeviceExchange | null; onClose: () => void }) {
  return (
    <Dialog open={!!exchange} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">{exchange && <ApproveBody exchange={exchange} onClose={onClose} />}</DialogContent>
    </Dialog>
  );
}

function ApproveBody({ exchange, onClose }: { exchange: DeviceExchange; onClose: () => void }) {
  const approve = useApproveExchange();
  const stock = useDevices({ status: 'IN_STOCK' });
  const [device, setDevice] = useState('');
  const [failure, setFailure] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  async function submit() {
    if (!device) { setFailure('Chọn máy mới trong kho.'); return; }
    try { const r = await approve.mutateAsync({ id: exchange.exchange_id, new_device_id: device }); toast.success('Đã duyệt đổi trả'); setApiKey(r.api_key); }
    catch (error) { setFailure(describeError(error)); }
  }
  return (
    <>
        <DialogHeader><DialogTitle>Duyệt đổi trả {exchange.old_serial_number}</DialogTitle><DialogDescription>Máy mới nhận doanh nghiệp, bảo hành (giữ hạn) và sản lượng còn lại của máy cũ. Máy cũ chuyển sang Đã đổi trả.</DialogDescription></DialogHeader>
        {apiKey ? (
          <><SecretReveal label="API key của máy mới" value={apiKey} hint="Nạp vào máy mới. Chỉ hiện một lần." /><DialogFooter><Button onClick={onClose}>Đã lưu, đóng</Button></DialogFooter></>
        ) : (
          <>
            <FormError message={failure} />
            <Field label="Máy mới (trong kho)"><Select value={device} onValueChange={setDevice}><SelectTrigger><SelectValue placeholder="Chọn máy" /></SelectTrigger><SelectContent>{stock.data?.pages.flatMap((p) => p.items).map((d) => <SelectItem key={d.device_id} value={d.device_id}>{d.serial_number}{d.model ? ` · ${d.model}` : ''}</SelectItem>)}</SelectContent></Select></Field>
            <DialogFooter><Button variant="outline" onClick={onClose}>Huỷ</Button><Button onClick={submit} disabled={approve.isPending}>{approve.isPending && <Loader2 className="animate-spin" />}Duyệt</Button></DialogFooter>
          </>
        )}
    </>
  );
}
