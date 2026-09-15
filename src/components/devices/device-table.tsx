'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable, type Column } from '@/components/common/data-table';
import { EnterpriseSelect } from '@/components/common/enterprise-select';
import { FilterBar, SearchInput } from '@/components/common/filter-bar';
import { useSession } from '@/components/common/session-provider';
import { DEVICE_STATUS_LABEL, DeviceStatusBadge, OnlineDot } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounced } from '@/hooks/use-debounced';
import { useDeviceTypes, useDevices } from '@/hooks/use-devices';
import { formatDateTime } from '@/lib/utils/date';
import type { Device, DeviceStatus } from '@/types/device';
import { DeviceFormDialog } from './device-form-dialog';

const ALL = '__all__';

export function DeviceTable() {
  const router = useRouter();
  const { can } = useSession();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [enterprise, setEnterprise] = useState('');
  const [creating, setCreating] = useState(false);
  const debouncedQ = useDebounced(q, 300);
  const types = useDeviceTypes();
  const query = useDevices({ q: debouncedQ || undefined, status: (status || undefined) as DeviceStatus | undefined, device_type: type || undefined, enterprise_id: enterprise || undefined });
  const rows = query.data?.pages.flatMap((p) => p.items) ?? [];

  const columns: Column<Device>[] = [
    { key: 'serial', header: 'Serial', cell: (d) => <Link href={`/thiet-bi/${d.device_id}`} className="font-mono text-[13px] font-medium text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{d.serial_number}</Link> },
    { key: 'device', header: 'Thiết bị', cell: (d) => <div><div>{d.name ?? d.model ?? '—'}</div><div className="text-xs text-muted-foreground">{types.data?.items.find((t) => t.code === d.device_type)?.name ?? d.device_type}{d.model && d.name ? ` · ${d.model}` : ''}</div></div> },
    { key: 'enterprise', header: 'Doanh nghiệp', cell: (d) => d.enterprise_name ?? <span className="text-muted-foreground">Chưa gán</span> },
    { key: 'status', header: 'Trạng thái', cell: (d) => <DeviceStatusBadge status={d.status} /> },
    { key: 'online', header: 'Kết nối', cell: (d) => <OnlineDot online={d.is_online} lastSeenAt={d.last_seen_at} /> },
    { key: 'seen', header: 'Lần cuối thấy', className: 'tabular', cell: (d) => formatDateTime(d.last_seen_at) },
  ];

  return (
    <>
      <FilterBar>
        <SearchInput value={q} onChange={setQ} placeholder="Serial, tên, model…" />
        <Select value={status || ALL} onValueChange={(v) => setStatus(v === ALL ? '' : v)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Mọi trạng thái</SelectItem>{(Object.keys(DEVICE_STATUS_LABEL) as DeviceStatus[]).map((s) => <SelectItem key={s} value={s}>{DEVICE_STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={type || ALL} onValueChange={(v) => setType(v === ALL ? '' : v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Mọi loại</SelectItem>{types.data?.items.map((t) => <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>)}</SelectContent>
        </Select>
        {can('enterprise.read') && <EnterpriseSelect value={enterprise} onChange={setEnterprise} allowAll />}
        <div className="ml-auto">{can('device.create') && <Button onClick={() => setCreating(true)}><Plus />Nhập kho</Button>}</div>
      </FilterBar>

      <DataTable columns={columns} rows={rows} rowKey={(d) => d.device_id} isPending={query.isPending} error={query.error} emptyText="Không có thiết bị nào khớp bộ lọc." hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} onLoadMore={() => query.fetchNextPage()} onRowClick={(d) => router.push(`/thiet-bi/${d.device_id}`)} />

      <DeviceFormDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}
