'use client';

import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable, type Column } from '@/components/common/data-table';
import { EnterpriseSelect } from '@/components/common/enterprise-select';
import { FilterBar } from '@/components/common/filter-bar';
import { useSession } from '@/components/common/session-provider';
import { SeverityBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlerts, useRunScan } from '@/hooks/use-misc';
import { formatDateTime } from '@/lib/utils/date';
import { describeError } from '@/lib/utils/errors';
import type { Alert, AlertGroup, AlertSeverity } from '@/types/alert';

const ALL = '__all__';
const GROUP_LABEL: Record<AlertGroup, string> = { QUOTA: 'Sản lượng', WARRANTY: 'Bảo hành', DEVICE: 'Thiết bị' };
export const ALERT_TYPE_LABEL: Record<string, string> = {
  QUOTA_BELOW_20: 'Còn < 20 %', QUOTA_BELOW_10: 'Còn < 10 %', QUOTA_EXHAUSTED: 'Hết sản lượng',
  WARRANTY_30D: 'BH còn 30 ngày', WARRANTY_15D: 'BH còn 15 ngày', WARRANTY_7D: 'BH còn 7 ngày', WARRANTY_EXPIRED: 'BH hết hạn',
  DEVICE_OFFLINE: 'Mất kết nối',
};

export function AlertTable() {
  const { user } = useSession();
  const isAdmin = user?.enterprise_id === null;
  const [group, setGroup] = useState('');
  const [severity, setSeverity] = useState('');
  const [resolved, setResolved] = useState('open');
  const [enterprise, setEnterprise] = useState('');
  const query = useAlerts({ group: (group || undefined) as AlertGroup | undefined, severity: (severity || undefined) as AlertSeverity | undefined, resolved: resolved === 'open' ? false : resolved === 'resolved' ? true : undefined, enterprise_id: enterprise || undefined });
  const scan = useRunScan();
  const rows = query.data?.pages.flatMap((p) => p.items) ?? [];

  const columns: Column<Alert>[] = [
    { key: 'at', header: 'Thời điểm', className: 'tabular', cell: (a) => formatDateTime(a.occurred_at) },
    { key: 'sev', header: 'Mức', cell: (a) => <SeverityBadge severity={a.severity} /> },
    { key: 'type', header: 'Loại', cell: (a) => <div><div>{ALERT_TYPE_LABEL[a.type] ?? a.type}</div><div className="text-xs text-muted-foreground">{GROUP_LABEL[a.group]}</div></div> },
    { key: 'device', header: 'Thiết bị', cell: (a) => <div><Link href={`/thiet-bi/${a.device_id}`} className="font-mono text-[13px] text-primary hover:underline">{a.serial_number}</Link><div className="text-xs text-muted-foreground">{a.enterprise_name ?? ''}</div></div> },
    { key: 'msg', header: 'Nội dung', className: 'max-w-[24rem]', cell: (a) => a.message },
    { key: 'res', header: 'Trạng thái', cell: (a) => (a.resolved_at ? <span className="text-xs text-muted-foreground">đã đóng {formatDateTime(a.resolved_at)}</span> : <span className="text-xs font-medium text-warning-foreground">đang mở</span>) },
  ];

  return (
    <>
      <FilterBar>
        <Select value={resolved || ALL} onValueChange={(v) => setResolved(v === ALL ? '' : v)}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Đang mở</SelectItem><SelectItem value="resolved">Đã đóng</SelectItem><SelectItem value={ALL}>Tất cả</SelectItem></SelectContent></Select>
        <Select value={group || ALL} onValueChange={(v) => setGroup(v === ALL ? '' : v)}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Mọi nhóm</SelectItem>{(Object.keys(GROUP_LABEL) as AlertGroup[]).map((g) => <SelectItem key={g} value={g}>{GROUP_LABEL[g]}</SelectItem>)}</SelectContent></Select>
        <Select value={severity || ALL} onValueChange={(v) => setSeverity(v === ALL ? '' : v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Mọi mức</SelectItem><SelectItem value="INFO">Thông tin</SelectItem><SelectItem value="WARNING">Cảnh báo</SelectItem><SelectItem value="CRITICAL">Nghiêm trọng</SelectItem></SelectContent></Select>
        {isAdmin && <EnterpriseSelect value={enterprise} onChange={setEnterprise} allowAll />}
        {isAdmin && <div className="ml-auto"><Button variant="outline" onClick={() => scan.mutateAsync().then((r) => toast.success(`Đã quét: ${(r.warranty_alerts ?? 0) + (r.offline_alerts ?? 0)} cảnh báo mới`)).catch((e) => toast.error(describeError(e)))} disabled={scan.isPending}><RefreshCw className={scan.isPending ? 'animate-spin' : ''} />Quét ngay</Button></div>}
      </FilterBar>
      <DataTable columns={columns} rows={rows} rowKey={(a) => a.alert_id} isPending={query.isPending} error={query.error} emptyText="Không có cảnh báo." hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} onLoadMore={() => query.fetchNextPage()} />
    </>
  );
}
