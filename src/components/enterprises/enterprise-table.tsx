'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable, type Column } from '@/components/common/data-table';
import { FilterBar, SearchInput } from '@/components/common/filter-bar';
import { useSession } from '@/components/common/session-provider';
import { EnterpriseStatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounced } from '@/hooks/use-debounced';
import { useEnterprises } from '@/hooks/use-enterprises';
import type { Enterprise, EnterpriseStatus } from '@/types/enterprise';
import { EnterpriseFormDialog } from './enterprise-form-dialog';

const ALL = '__all__';

export function EnterpriseTable() {
  const router = useRouter();
  const { can } = useSession();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [level, setLevel] = useState('');
  const [creating, setCreating] = useState(false);
  const debouncedQ = useDebounced(q, 300);
  const query = useEnterprises({ q: debouncedQ || undefined, status: (status || undefined) as EnterpriseStatus | undefined, parent_id: level === 'root' ? 'null' : undefined });
  const rows = query.data?.pages.flatMap((p) => p.items) ?? [];

  const columns: Column<Enterprise>[] = [
    { key: 'code', header: 'Mã', cell: (e) => <Link href={`/doanh-nghiep/${e.enterprise_id}`} className="font-mono text-[13px] font-medium text-primary hover:underline" onClick={(ev) => ev.stopPropagation()}>{e.code}</Link> },
    { key: 'name', header: 'Doanh nghiệp', cell: (e) => <div><div>{e.name}</div>{e.parent_name && <div className="text-xs text-muted-foreground">↳ thuộc {e.parent_name}</div>}</div> },
    { key: 'contact', header: 'Liên hệ', cell: (e) => <div className="text-sm">{e.contact_name ?? '—'}<div className="text-xs text-muted-foreground">{e.phone ?? e.email ?? ''}</div></div> },
    { key: 'status', header: 'Trạng thái', cell: (e) => <EnterpriseStatusBadge status={e.status} /> },
    { key: 'users', header: 'Tài khoản', className: 'tabular text-right', cell: (e) => `${e.user_count} / ${e.max_users}` },
    { key: 'devices', header: 'Thiết bị', className: 'tabular text-right', cell: (e) => e.device_count },
    { key: 'branches', header: 'Chi nhánh', className: 'tabular text-right', cell: (e) => e.branch_count },
  ];

  return (
    <>
      <FilterBar>
        <SearchInput value={q} onChange={setQ} placeholder="Mã, tên, mã số thuế…" />
        <Select value={status || ALL} onValueChange={(v) => setStatus(v === ALL ? '' : v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Mọi trạng thái</SelectItem><SelectItem value="ACTIVE">Hoạt động</SelectItem><SelectItem value="SUSPENDED">Đình chỉ</SelectItem></SelectContent>
        </Select>
        <Select value={level || ALL} onValueChange={(v) => setLevel(v === ALL ? '' : v)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Cả chi nhánh</SelectItem><SelectItem value="root">Chỉ doanh nghiệp gốc</SelectItem></SelectContent>
        </Select>
        <div className="ml-auto">{can('enterprise.create') && <Button onClick={() => setCreating(true)}><Plus />Thêm doanh nghiệp</Button>}</div>
      </FilterBar>
      <DataTable columns={columns} rows={rows} rowKey={(e) => e.enterprise_id} isPending={query.isPending} error={query.error} hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} onLoadMore={() => query.fetchNextPage()} onRowClick={(e) => router.push(`/doanh-nghiep/${e.enterprise_id}`)} />
      <EnterpriseFormDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}
