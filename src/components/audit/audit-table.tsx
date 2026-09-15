'use client';

import { useState } from 'react';
import { DataTable, type Column } from '@/components/common/data-table';
import { EnterpriseSelect } from '@/components/common/enterprise-select';
import { FilterBar, SearchInput } from '@/components/common/filter-bar';
import { useSession } from '@/components/common/session-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuditLogs } from '@/hooks/use-misc';
import { formatDateTime } from '@/lib/utils/date';
import type { AuditLog } from '@/types/audit';

const ALL = '__all__';
const MODULES = ['auth', 'user', 'enterprise', 'device', 'warranty', 'quota', 'exchange'];

export function AuditTable() {
  const { user } = useSession();
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [enterprise, setEnterprise] = useState('');
  const [open, setOpen] = useState<AuditLog | null>(null);
  const query = useAuditLogs({ module: module || undefined, action: action.trim().toUpperCase() || undefined, enterprise_id: enterprise || undefined });
  const rows = query.data?.pages.flatMap((p) => p.items) ?? [];

  const columns: Column<AuditLog>[] = [
    { key: 'at', header: 'Thời điểm', className: 'tabular whitespace-nowrap', cell: (a) => formatDateTime(a.occurred_at) },
    { key: 'actor', header: 'Người thao tác', cell: (a) => a.actor_username ?? <span className="text-muted-foreground">hệ thống</span> },
    { key: 'action', header: 'Hành động', cell: (a) => <div><code className="font-mono text-xs">{a.action}</code><div className="text-xs text-muted-foreground">{a.module}</div></div> },
    { key: 'res', header: 'Đối tượng', cell: (a) => <div className="text-xs">{a.resource_type}<div className="font-mono text-muted-foreground">{a.resource_id?.slice(0, 8) ?? ''}</div></div> },
    { key: 'ent', header: 'Doanh nghiệp', cell: (a) => a.enterprise_name ?? '—' },
    { key: 'ip', header: 'IP', className: 'font-mono text-xs', cell: (a) => a.ip ?? '—' },
  ];

  return (
    <>
      <FilterBar>
        <Select value={module || ALL} onValueChange={(v) => setModule(v === ALL ? '' : v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Mọi nhóm</SelectItem>{MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
        <SearchInput value={action} onChange={setAction} placeholder="Mã hành động, vd DEVICE_ASSIGN" />
        {user?.enterprise_id === null && <EnterpriseSelect value={enterprise} onChange={setEnterprise} allowAll />}
      </FilterBar>
      <DataTable columns={columns} rows={rows} rowKey={(a) => a.audit_id} isPending={query.isPending} error={query.error} hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} onLoadMore={() => query.fetchNextPage()} onRowClick={setOpen} />
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{open?.action} · {open && formatDateTime(open.occurred_at)}</DialogTitle></DialogHeader>
          {open && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground"><div>Người: <b className="text-foreground">{open.actor_username ?? 'hệ thống'}</b></div><div>IP: {open.ip ?? '—'}</div><div>Đối tượng: {open.resource_type} {open.resource_id}</div><div>request_id: <code>{open.request_id}</code></div></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><div className="mb-1 text-xs font-medium text-muted-foreground">Trước</div><pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(open.old_values ?? {}, null, 2)}</pre></div>
                <div><div className="mb-1 text-xs font-medium text-muted-foreground">Sau</div><pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(open.new_values ?? {}, null, 2)}</pre></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
