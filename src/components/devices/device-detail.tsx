'use client';

import { ArrowLeft, Building2, Copy, KeyRound, Lock, LockOpen, MoreHorizontal, Pencil, Plus, Trash2, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DataTable, type Column } from '@/components/common/data-table';
import { PageHeader } from '@/components/common/page-header';
import { QuotaBar } from '@/components/common/quota-bar';
import { SecretReveal } from '@/components/common/secret-reveal';
import { useSession } from '@/components/common/session-provider';
import { DeviceStatusBadge, OnlineDot, WarrantyStatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChangeDeviceStatus, useDeleteDevice, useDevice, useDeviceUsage, useDeviceWarranties, useRotateApiKey, useUnassignDevice } from '@/hooks/use-devices';
import { useQuotaGrants } from '@/hooks/use-quotas';
import { formatDate, formatDateTime, formatNumber } from '@/lib/utils/date';
import { describeError } from '@/lib/utils/errors';
import type { QuotaGrant, UsageLog } from '@/types/quota';
import type { WarrantyRow } from '@/types/warranty';
import { AssignDialog } from './assign-dialog';
import { DeviceFormDialog } from './device-form-dialog';
import { GrantQuotaDialog } from './grant-quota-dialog';

type Modal = null | 'edit' | 'assign' | 'unassign' | 'lock' | 'unlock' | 'retire' | 'delete' | 'grant' | 'rotate';

export function DeviceDetail({ deviceId }: { deviceId: string }) {
  const router = useRouter();
  const { can, user } = useSession();
  const isAdmin = user?.enterprise_id === null;
  const q = useDevice(deviceId);
  const [modal, setModal] = useState<Modal>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const unassign = useUnassignDevice(deviceId);
  const changeStatus = useChangeDeviceStatus(deviceId);
  const rotate = useRotateApiKey(deviceId);
  const del = useDeleteDevice();

  if (q.isPending) return <div className="py-20 text-center text-muted-foreground">Đang tải…</div>;
  if (q.isError || !q.data) return <div className="py-20 text-center text-danger">{describeError(q.error)}</div>;
  const d = q.data;
  const st = d.status;

  const actions = (
    <>
      {can('device.update') && <Button variant="outline" onClick={() => setModal('edit')}><Pencil />Sửa</Button>}
      {isAdmin && can('quota.grant') && st !== 'EXCHANGED' && st !== 'RETIRED' && <Button variant="outline" onClick={() => setModal('grant')}><Plus />Cấp sản lượng</Button>}
      {isAdmin && can('device.assign') && st === 'IN_STOCK' && <Button onClick={() => setModal('assign')}><Building2 />Gán cho doanh nghiệp</Button>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Thao tác khác"><MoreHorizontal /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {can('device.status') && st === 'ACTIVE' && <DropdownMenuItem onClick={() => setModal('lock')}><Lock />Khoá máy</DropdownMenuItem>}
          {can('device.status') && st === 'LOCKED' && <DropdownMenuItem onClick={() => setModal('unlock')}><LockOpen />Mở khoá</DropdownMenuItem>}
          {isAdmin && can('device.assign') && (st === 'ACTIVE' || st === 'LOCKED') && <DropdownMenuItem onClick={() => setModal('rotate')}><KeyRound />Cấp lại API key</DropdownMenuItem>}
          {isAdmin && can('device.assign') && (st === 'ACTIVE' || st === 'LOCKED') && <DropdownMenuItem onClick={() => setModal('unassign')}><Undo2 />Thu hồi về kho</DropdownMenuItem>}
          {isAdmin && st === 'IN_STOCK' && <DropdownMenuSeparator />}
          {isAdmin && can('device.status') && st === 'IN_STOCK' && <DropdownMenuItem onClick={() => setModal('retire')}><Trash2 />Thanh lý</DropdownMenuItem>}
          {isAdmin && can('device.delete') && st === 'IN_STOCK' && <DropdownMenuItem variant="destructive" onClick={() => setModal('delete')}><Trash2 />Xoá khỏi hệ thống</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <>
      <Link href="/thiet-bi" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Thiết bị</Link>
      <PageHeader title={d.serial_number} description={[d.name, d.model, d.device_type].filter(Boolean).join(' · ')} actions={actions} />

      {apiKey && (
        <Dialog open onOpenChange={() => setApiKey(null)}>
          <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>API key mới</DialogTitle></DialogHeader><SecretReveal label="API key của thiết bị" value={apiKey} /><Button onClick={() => setApiKey(null)}>Đã lưu, đóng</Button></DialogContent>
        </Dialog>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Thông tin</CardTitle></CardHeader>
          <CardContent className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <Info label="Trạng thái"><DeviceStatusBadge status={d.status} /></Info>
            <Info label="Kết nối"><OnlineDot online={d.is_online} lastSeenAt={d.last_seen_at} /></Info>
            <Info label="Doanh nghiệp">{d.enterprise_id ? <Link href={`/doanh-nghiep/${d.enterprise_id}`} className="text-primary hover:underline">{d.enterprise_name}</Link> : <span className="text-muted-foreground">Chưa gán</span>}</Info>
            <Info label="Ngày bán">{formatDate(d.sold_at)}</Info>
            <Info label="Gán lúc">{formatDateTime(d.assigned_at)}</Info>
            <Info label="Lần cuối thấy">{formatDateTime(d.last_seen_at)}</Info>
            <Info label="Firmware">{d.firmware_version ?? '—'}</Info>
            <Info label="Nhập kho">{formatDateTime(d.created_at)}</Info>
            {d.notes && <div className="sm:col-span-2"><div className="text-xs text-muted-foreground">Ghi chú</div><div className="whitespace-pre-wrap">{d.notes}</div></div>}
            <div className="sm:col-span-2 text-xs text-muted-foreground">ID <code className="font-mono">{d.device_id}</code> <Button variant="ghost" size="icon-xs" onClick={() => { navigator.clipboard.writeText(d.device_id); toast.success('Đã sao chép device_id'); }} aria-label="Sao chép"><Copy /></Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sản lượng</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <QuotaBar total={d.quota.quota_total} remaining={d.quota.quota_remaining} pct={d.quota.remaining_pct} />
            <div className="grid grid-cols-2 gap-2">
              <Info label="Đã dùng">{formatNumber(d.quota.quota_used)}</Info>
              <Info label="Ngưỡng cảnh báo">{d.quota.warn_threshold_pct} %</Info>
              <Info label="Gói từ">{formatDate(d.quota.package_start_at?.slice(0, 10) ?? null)}</Info>
              <Info label="Gói đến">{formatDate(d.quota.package_end_at?.slice(0, 10) ?? null)}</Info>
            </div>
            {d.quota.is_locked && <div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">Đang khoá · {LOCK_REASON[d.quota.locked_reason ?? ''] ?? d.quota.locked_reason} · {formatDateTime(d.quota.locked_at)}</div>}
            <div className="border-t pt-3">
              <div className="mb-1 text-xs text-muted-foreground">Bảo hành</div>
              {d.warranty ? (
                <div className="flex items-center justify-between"><span>{formatDate(d.warranty.start_date)} → {formatDate(d.warranty.end_date)}</span><span className={d.warranty.days_remaining <= 30 ? 'font-medium text-danger' : 'text-muted-foreground'}>{d.warranty.days_remaining < 0 ? 'quá hạn' : `còn ${d.warranty.days_remaining} ngày`}</span></div>
              ) : <span className="text-muted-foreground">Không có bảo hành đang hiệu lực</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="mt-6">
        <TabsList>
          <TabsTrigger value="usage">Lượt sử dụng</TabsTrigger>
          <TabsTrigger value="grants">Lịch sử cấp</TabsTrigger>
          <TabsTrigger value="warranty">Bảo hành</TabsTrigger>
        </TabsList>
        <TabsContent value="usage"><UsageTab deviceId={deviceId} /></TabsContent>
        <TabsContent value="grants"><GrantsTab deviceId={deviceId} /></TabsContent>
        <TabsContent value="warranty"><WarrantyTab deviceId={deviceId} /></TabsContent>
      </Tabs>

      <DeviceFormDialog open={modal === 'edit'} onOpenChange={(o) => !o && setModal(null)} device={d} />
      <AssignDialog open={modal === 'assign'} onOpenChange={(o) => !o && setModal(null)} deviceId={deviceId} serial={d.serial_number} />
      <GrantQuotaDialog open={modal === 'grant'} onOpenChange={(o) => !o && setModal(null)} deviceId={deviceId} serial={d.serial_number} currentTotal={d.quota.quota_total} />
      <ConfirmDialog open={modal === 'unassign'} onOpenChange={(o) => !o && setModal(null)} title="Thu hồi máy về kho" description="Máy rời doanh nghiệp, API key bị thu hồi (máy ngoài hiện trường không gửi được lượt nữa), bảo hành hiện tại bị huỷ. Sản lượng còn lại giữ nguyên trên máy." reasonLabel="Lý do" confirmLabel="Thu hồi" destructive onConfirm={(reason) => unassign.mutateAsync(reason)} successMessage="Đã thu hồi máy" />
      <ConfirmDialog open={modal === 'lock'} onOpenChange={(o) => !o && setModal(null)} title="Khoá máy" description="Máy ngừng ghi lượt dùng cho tới khi mở khoá." reasonLabel="Lý do" confirmLabel="Khoá" destructive onConfirm={(reason) => changeStatus.mutateAsync({ status: 'LOCKED', reason })} successMessage="Đã khoá máy" />
      <ConfirmDialog open={modal === 'unlock'} onOpenChange={(o) => !o && setModal(null)} title="Mở khoá máy" description={d.quota.quota_remaining <= 0 ? 'Máy đang hết sản lượng — cấp thêm trước, nếu không server sẽ từ chối.' : 'Máy hoạt động trở lại.'} reasonLabel="Lý do" confirmLabel="Mở khoá" onConfirm={(reason) => changeStatus.mutateAsync({ status: 'ACTIVE', reason })} successMessage="Đã mở khoá" />
      <ConfirmDialog open={modal === 'retire'} onOpenChange={(o) => !o && setModal(null)} title="Thanh lý máy" description="Không quay lại được. Máy giữ trong hệ thống với trạng thái Đã thanh lý để tra cứu lịch sử." reasonLabel="Lý do" confirmLabel="Thanh lý" destructive onConfirm={(reason) => changeStatus.mutateAsync({ status: 'RETIRED', reason })} successMessage="Đã thanh lý" />
      <ConfirmDialog open={modal === 'rotate'} onOpenChange={(o) => !o && setModal(null)} title="Cấp lại API key" description="Key cũ chết ngay lập tức — máy phải được nạp key mới mới gửi được lượt dùng." confirmLabel="Cấp lại" onConfirm={async () => { const r = await rotate.mutateAsync(); setApiKey(r.api_key); }} />
      <ConfirmDialog open={modal === 'delete'} onOpenChange={(o) => !o && setModal(null)} title="Xoá máy khỏi hệ thống" description="Chỉ xoá được máy trong kho chưa có lịch sử. Không hoàn tác." confirmLabel="Xoá" destructive onConfirm={async () => { await del.mutateAsync(deviceId); router.replace('/thiet-bi'); }} successMessage="Đã xoá" />
    </>
  );
}

const LOCK_REASON: Record<string, string> = { QUOTA_EXHAUSTED: 'hết sản lượng', PACKAGE_EXPIRED: 'hết thời gian gói', MANUAL: 'khoá tay' };

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="mt-0.5">{children}</div></div>;
}

function UsageTab({ deviceId }: { deviceId: string }) {
  const q = useDeviceUsage(deviceId);
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [];
  const columns: Column<UsageLog>[] = [
    { key: 'used', header: 'Giờ máy', className: 'tabular', cell: (u) => formatDateTime(u.used_at) },
    { key: 'recv', header: 'Giờ server', className: 'tabular text-muted-foreground', cell: (u) => formatDateTime(u.received_at) },
    { key: 'ref', header: 'client_ref', className: 'font-mono text-xs', cell: (u) => u.client_ref },
    { key: 'amount', header: 'Số lượng', className: 'tabular text-right', cell: (u) => formatNumber(u.amount) },
    { key: 'after', header: 'Còn lại sau', className: 'tabular text-right', cell: (u) => (u.rejected ? <span className="text-danger">bị từ chối</span> : formatNumber(u.remaining_after)) },
  ];
  return <DataTable columns={columns} rows={rows} rowKey={(u) => u.usage_id} isPending={q.isPending} error={q.error} emptyText="Máy chưa gửi lượt dùng nào." hasNextPage={q.hasNextPage} isFetchingNextPage={q.isFetchingNextPage} onLoadMore={() => q.fetchNextPage()} />;
}

function GrantsTab({ deviceId }: { deviceId: string }) {
  const q = useQuotaGrants(deviceId);
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [];
  const columns: Column<QuotaGrant>[] = [
    { key: 'at', header: 'Thời điểm', className: 'tabular', cell: (g) => formatDateTime(g.granted_at) },
    { key: 'amount', header: 'Cấp', className: 'tabular text-right', cell: (g) => `+${formatNumber(g.amount)}` },
    { key: 'after', header: 'Tổng sau cấp', className: 'tabular text-right', cell: (g) => formatNumber(g.total_after) },
    { key: 'by', header: 'Người cấp', cell: (g) => g.granted_by_name ?? '—' },
    { key: 'note', header: 'Ghi chú', cell: (g) => g.note ?? '—' },
  ];
  return <DataTable columns={columns} rows={rows} rowKey={(g) => g.grant_id} isPending={q.isPending} error={q.error} emptyText="Chưa cấp sản lượng lần nào." hasNextPage={q.hasNextPage} isFetchingNextPage={q.isFetchingNextPage} onLoadMore={() => q.fetchNextPage()} />;
}

function WarrantyTab({ deviceId }: { deviceId: string }) {
  const q = useDeviceWarranties(deviceId);
  const columns: Column<WarrantyRow>[] = [
    { key: 'range', header: 'Hiệu lực', cell: (w) => `${formatDate(w.start_date)} → ${formatDate(w.end_date)}` },
    { key: 'status', header: 'Trạng thái', cell: (w) => <WarrantyStatusBadge status={w.status} /> },
    { key: 'source', header: 'Nguồn', cell: (w) => ({ SALE: 'Bán máy', EXCHANGE: 'Đổi trả', EXTENSION: 'Gia hạn' })[w.source] },
    { key: 'days', header: 'Còn lại', className: 'tabular', cell: (w) => (w.status === 'ACTIVE' ? `${w.days_remaining} ngày` : '—') },
    { key: 'notes', header: 'Ghi chú', cell: (w) => w.notes ?? '—' },
  ];
  return <DataTable columns={columns} rows={q.data?.items ?? []} rowKey={(w) => w.warranty_id} isPending={q.isPending} error={q.error} emptyText="Chưa có lượt bảo hành." />;
}
