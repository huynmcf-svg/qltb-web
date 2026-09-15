'use client';

import { ArrowRightLeft, Lock, LockOpen, MoreHorizontal, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DataTable, type Column } from '@/components/common/data-table';
import { EnterpriseSelect } from '@/components/common/enterprise-select';
import { FilterBar, SearchInput } from '@/components/common/filter-bar';
import { QuotaBar } from '@/components/common/quota-bar';
import { useSession } from '@/components/common/session-provider';
import { DeviceStatusBadge } from '@/components/common/status-badge';
import { GrantQuotaDialog } from '@/components/devices/grant-quota-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounced } from '@/hooks/use-debounced';
import { useAllocations, useLockQuota, useQuotas, useUnlockQuota } from '@/hooks/use-quotas';
import { formatDate, formatDateTime, formatNumber } from '@/lib/utils/date';
import type { DeviceStatus } from '@/types/device';
import type { QuotaAllocation, QuotaRow } from '@/types/quota';
import { AllocateDialog } from './allocate-dialog';

const ALL = '__all__';
type Modal = null | { kind: 'grant' | 'lock' | 'unlock'; row: QuotaRow } | { kind: 'allocate' };

export function QuotaTable() {
  const { can, user } = useSession();
  const isAdmin = user?.enterprise_id === null;
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [enterprise, setEnterprise] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const query = useQuotas({ q: useDebounced(q, 300) || undefined, enterprise_id: enterprise || undefined, is_locked: filter === 'locked' ? true : undefined, below_pct: filter === 'low' ? 20 : undefined });
  const lock = useLockQuota();
  const unlock = useUnlockQuota();
  const rows = query.data?.pages.flatMap((p) => p.items) ?? [];

  const columns: Column<QuotaRow>[] = [
    { key: 'serial', header: 'Thiết bị', cell: (r) => <div><Link href={`/thiet-bi/${r.device_id}`} className="font-mono text-[13px] font-medium text-primary hover:underline">{r.serial_number}</Link><div className="text-xs text-muted-foreground">{r.device_name ?? ''}</div></div> },
    { key: 'ent', header: 'Doanh nghiệp', cell: (r) => r.enterprise_name ?? <span className="text-muted-foreground">Chưa gán</span> },
    { key: 'status', header: 'Trạng thái', cell: (r) => <div className="flex flex-col gap-1"><DeviceStatusBadge status={r.device_status as DeviceStatus} />{r.is_locked && <span className="text-[11px] text-danger">{({ QUOTA_EXHAUSTED: 'hết sản lượng', PACKAGE_EXPIRED: 'hết gói', MANUAL: 'khoá tay' })[r.locked_reason ?? ''] ?? r.locked_reason}</span>}</div> },
    { key: 'quota', header: 'Sản lượng còn lại', className: 'min-w-[12rem]', cell: (r) => <QuotaBar total={r.quota_total} remaining={r.quota_remaining} pct={r.remaining_pct} compact /> },
    { key: 'used', header: 'Đã dùng', className: 'tabular text-right', cell: (r) => formatNumber(r.quota_used) },
    { key: 'pkg', header: 'Hết gói', className: 'tabular', cell: (r) => formatDate(r.package_end_at?.slice(0, 10) ?? null) },
    {
      key: 'actions', header: '', className: 'w-10', cell: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Thao tác"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAdmin && can('quota.grant') && r.device_status !== 'EXCHANGED' && r.device_status !== 'RETIRED' && <DropdownMenuItem onClick={() => setModal({ kind: 'grant', row: r })}><Plus />Cấp sản lượng</DropdownMenuItem>}
            {can('quota.lock') && r.device_status === 'ACTIVE' && <DropdownMenuItem onClick={() => setModal({ kind: 'lock', row: r })}><Lock />Khoá máy</DropdownMenuItem>}
            {can('quota.lock') && r.device_status === 'LOCKED' && <DropdownMenuItem onClick={() => setModal({ kind: 'unlock', row: r })}><LockOpen />Mở khoá</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  const m = modal && 'row' in modal ? modal.row : null;

  return (
    <Tabs defaultValue="quotas">
      <TabsList><TabsTrigger value="quotas">Theo thiết bị</TabsTrigger><TabsTrigger value="allocations">Lịch sử phân bổ</TabsTrigger></TabsList>
      <TabsContent value="quotas">
        <FilterBar>
          <SearchInput value={q} onChange={setQ} placeholder="Serial, tên máy…" />
          <Select value={filter || ALL} onValueChange={(v) => setFilter(v === ALL ? '' : v)}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Tất cả</SelectItem><SelectItem value="low">Còn dưới 20 %</SelectItem><SelectItem value="locked">Đang khoá</SelectItem></SelectContent></Select>
          {isAdmin && <EnterpriseSelect value={enterprise} onChange={setEnterprise} allowAll />}
          <div className="ml-auto">{can('quota.allocate') && <Button variant="outline" onClick={() => setModal({ kind: 'allocate' })}><ArrowRightLeft />Phân bổ xuống chi nhánh</Button>}</div>
        </FilterBar>
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.device_id} isPending={query.isPending} error={query.error} hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} onLoadMore={() => query.fetchNextPage()} />
      </TabsContent>
      <TabsContent value="allocations"><AllocationsTable /></TabsContent>

      {m && modal?.kind === 'grant' && <GrantQuotaDialog open onOpenChange={(o) => !o && setModal(null)} deviceId={m.device_id} serial={m.serial_number} currentTotal={m.quota_total} />}
      <ConfirmDialog open={modal?.kind === 'lock'} onOpenChange={(o) => !o && setModal(null)} title={`Khoá ${m?.serial_number}`} description="Máy ngừng ghi lượt dùng cho tới khi mở khoá." reasonLabel="Lý do" confirmLabel="Khoá" destructive onConfirm={(reason) => lock.mutateAsync({ device_id: m!.device_id, reason })} successMessage="Đã khoá" />
      <ConfirmDialog open={modal?.kind === 'unlock'} onOpenChange={(o) => !o && setModal(null)} title={`Mở khoá ${m?.serial_number}`} description={m && m.quota_remaining <= 0 ? 'Máy đang hết sản lượng — cấp thêm trước.' : 'Máy hoạt động trở lại.'} confirmLabel="Mở khoá" onConfirm={() => unlock.mutateAsync(m!.device_id)} successMessage="Đã mở khoá" />
      <AllocateDialog open={modal?.kind === 'allocate'} onOpenChange={(o) => !o && setModal(null)} />
    </Tabs>
  );
}

function AllocationsTable() {
  const q = useAllocations();
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [];
  const columns: Column<QuotaAllocation>[] = [
    { key: 'at', header: 'Thời điểm', className: 'tabular', cell: (a) => formatDateTime(a.allocated_at) },
    { key: 'from', header: 'Từ', cell: (a) => <div>{a.from_enterprise_name}<div className="font-mono text-xs text-muted-foreground">{a.from_serial_number}</div></div> },
    { key: 'to', header: 'Đến', cell: (a) => <div>{a.to_enterprise_name}<div className="font-mono text-xs text-muted-foreground">{a.serial_number}</div></div> },
    { key: 'amount', header: 'Số lượng', className: 'tabular text-right', cell: (a) => formatNumber(a.amount) },
    { key: 'by', header: 'Người thực hiện', cell: (a) => a.allocated_by_name ?? '—' },
    { key: 'note', header: 'Ghi chú', cell: (a) => a.note ?? '—' },
  ];
  return <DataTable columns={columns} rows={rows} rowKey={(a) => a.allocation_id} isPending={q.isPending} error={q.error} emptyText="Chưa có phân bổ nào." hasNextPage={q.hasNextPage} isFetchingNextPage={q.isFetchingNextPage} onLoadMore={() => q.fetchNextPage()} />;
}
