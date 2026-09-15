'use client';

import { ArrowLeft, Ban, CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DataTable, type Column } from '@/components/common/data-table';
import { PageHeader } from '@/components/common/page-header';
import { useSession } from '@/components/common/session-provider';
import { DeviceStatusBadge, EnterpriseStatusBadge, OnlineDot, UserStatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDevices } from '@/hooks/use-devices';
import { useBranches, useChangeEnterpriseStatus, useDeleteEnterprise, useEnterprise } from '@/hooks/use-enterprises';
import { useUsers } from '@/hooks/use-users';
import { formatDateTime } from '@/lib/utils/date';
import { describeError } from '@/lib/utils/errors';
import type { Device } from '@/types/device';
import type { Enterprise } from '@/types/enterprise';
import type { User } from '@/types/user';
import { EnterpriseFormDialog } from './enterprise-form-dialog';

export function EnterpriseDetail({ enterpriseId }: { enterpriseId: string }) {
  const router = useRouter();
  const { can, user } = useSession();
  const isAdmin = user?.enterprise_id === null;
  const q = useEnterprise(enterpriseId);
  const [modal, setModal] = useState<null | 'edit' | 'branch' | 'suspend' | 'activate' | 'delete'>(null);
  const changeStatus = useChangeEnterpriseStatus();
  const del = useDeleteEnterprise();

  if (q.isPending) return <div className="py-20 text-center text-muted-foreground">Đang tải…</div>;
  if (q.isError || !q.data) return <div className="py-20 text-center text-danger">{describeError(q.error)}</div>;
  const e = q.data;

  return (
    <>
      <Link href="/doanh-nghiep" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Doanh nghiệp</Link>
      <PageHeader
        title={e.name}
        description={`${e.code}${e.parent_name ? ` · chi nhánh của ${e.parent_name}` : ''}`}
        actions={
          <>
            {can('enterprise.update') && <Button variant="outline" onClick={() => setModal('edit')}><Pencil />Sửa</Button>}
            {isAdmin && can('enterprise.create') && !e.parent_id && <Button variant="outline" onClick={() => setModal('branch')}><Plus />Thêm chi nhánh</Button>}
            {isAdmin && can('enterprise.status') && (e.status === 'ACTIVE' ? <Button variant="outline" className="text-danger" onClick={() => setModal('suspend')}><Ban />Đình chỉ</Button> : <Button onClick={() => setModal('activate')}><CheckCircle2 />Mở lại</Button>)}
            {isAdmin && can('enterprise.delete') && <Button variant="ghost" size="icon" className="text-danger" onClick={() => setModal('delete')} aria-label="Xoá"><Trash2 /></Button>}
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Thông tin</CardTitle></CardHeader>
          <CardContent className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <Info label="Trạng thái"><EnterpriseStatusBadge status={e.status} /></Info>
            <Info label="Mã số thuế">{e.tax_code ?? '—'}</Info>
            <Info label="Người liên hệ">{e.contact_name ?? '—'}</Info>
            <Info label="Điện thoại">{e.phone ?? '—'}</Info>
            <Info label="Email">{e.email ?? '—'}</Info>
            <Info label="Tạo lúc">{formatDateTime(e.created_at)}</Info>
            <div className="sm:col-span-2"><Info label="Địa chỉ">{e.address ?? '—'}</Info></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quy mô</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Tài khoản" value={`${e.user_count}/${e.max_users}`} />
            <Stat label="Thiết bị" value={e.device_count} />
            <Stat label="Chi nhánh" value={e.branch_count} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices" className="mt-6">
        <TabsList>
          <TabsTrigger value="devices">Thiết bị</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          {!e.parent_id && <TabsTrigger value="branches">Chi nhánh</TabsTrigger>}
        </TabsList>
        <TabsContent value="devices"><DevicesTab enterpriseId={enterpriseId} /></TabsContent>
        <TabsContent value="users"><UsersTab enterpriseId={enterpriseId} /></TabsContent>
        {!e.parent_id && <TabsContent value="branches"><BranchesTab enterpriseId={enterpriseId} /></TabsContent>}
      </Tabs>

      <EnterpriseFormDialog open={modal === 'edit'} onOpenChange={(o) => !o && setModal(null)} enterprise={e} />
      <EnterpriseFormDialog open={modal === 'branch'} onOpenChange={(o) => !o && setModal(null)} parentId={enterpriseId} />
      <ConfirmDialog open={modal === 'suspend'} onOpenChange={(o) => !o && setModal(null)} title="Đình chỉ doanh nghiệp" description="Áp cho cả chi nhánh. Mọi người dùng của doanh nghiệp mất đường vào ngay lập tức; thiết bị giữ nguyên trạng thái." reasonLabel="Lý do" confirmLabel="Đình chỉ" destructive onConfirm={(reason) => changeStatus.mutateAsync({ id: enterpriseId, status: 'SUSPENDED', reason })} successMessage="Đã đình chỉ" />
      <ConfirmDialog open={modal === 'activate'} onOpenChange={(o) => !o && setModal(null)} title="Mở lại doanh nghiệp" description="Mở lại cả cây chi nhánh." confirmLabel="Mở lại" onConfirm={() => changeStatus.mutateAsync({ id: enterpriseId, status: 'ACTIVE' })} successMessage="Đã mở lại" />
      <ConfirmDialog open={modal === 'delete'} onOpenChange={(o) => !o && setModal(null)} title="Xoá doanh nghiệp" description="Chỉ xoá được khi không còn thiết bị, người dùng, chi nhánh và lịch sử. Thường nên đình chỉ thay vì xoá." confirmLabel="Xoá" destructive onConfirm={async () => { await del.mutateAsync(enterpriseId); router.replace('/doanh-nghiep'); }} successMessage="Đã xoá" />
    </>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="mt-0.5">{children}</div></div>;
}
function Stat({ label, value }: { label: string; value: string | number }) {
  return <div><div className="text-2xl font-semibold tabular">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>;
}

function DevicesTab({ enterpriseId }: { enterpriseId: string }) {
  const router = useRouter();
  const q = useDevices({ enterprise_id: enterpriseId });
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [];
  const columns: Column<Device>[] = [
    { key: 'serial', header: 'Serial', className: 'font-mono text-[13px]', cell: (d) => d.serial_number },
    { key: 'name', header: 'Thiết bị', cell: (d) => d.name ?? d.model ?? d.device_type },
    { key: 'status', header: 'Trạng thái', cell: (d) => <DeviceStatusBadge status={d.status} /> },
    { key: 'online', header: 'Kết nối', cell: (d) => <OnlineDot online={d.is_online} lastSeenAt={d.last_seen_at} /> },
  ];
  return <DataTable columns={columns} rows={rows} rowKey={(d) => d.device_id} isPending={q.isPending} error={q.error} emptyText="Doanh nghiệp chưa có thiết bị." hasNextPage={q.hasNextPage} isFetchingNextPage={q.isFetchingNextPage} onLoadMore={() => q.fetchNextPage()} onRowClick={(d) => router.push(`/thiet-bi/${d.device_id}`)} />;
}

function UsersTab({ enterpriseId }: { enterpriseId: string }) {
  const q = useUsers({ enterprise_id: enterpriseId });
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [];
  const columns: Column<User>[] = [
    { key: 'username', header: 'Tên đăng nhập', className: 'font-mono text-[13px]', cell: (u) => u.username },
    { key: 'name', header: 'Họ tên', cell: (u) => u.full_name },
    { key: 'roles', header: 'Vai trò', cell: (u) => u.roles.map((r) => r.name).join(', ') },
    { key: 'status', header: 'Trạng thái', cell: (u) => <UserStatusBadge status={u.status} /> },
    { key: 'login', header: 'Đăng nhập gần nhất', className: 'tabular', cell: (u) => formatDateTime(u.last_login_at) },
  ];
  return <DataTable columns={columns} rows={rows} rowKey={(u) => u.user_id} isPending={q.isPending} error={q.error} emptyText="Chưa có tài khoản." hasNextPage={q.hasNextPage} isFetchingNextPage={q.isFetchingNextPage} onLoadMore={() => q.fetchNextPage()} />;
}

function BranchesTab({ enterpriseId }: { enterpriseId: string }) {
  const router = useRouter();
  const q = useBranches(enterpriseId);
  const columns: Column<Enterprise>[] = [
    { key: 'code', header: 'Mã', className: 'font-mono text-[13px]', cell: (b) => b.code },
    { key: 'name', header: 'Chi nhánh', cell: (b) => b.name },
    { key: 'status', header: 'Trạng thái', cell: (b) => <EnterpriseStatusBadge status={b.status} /> },
    { key: 'users', header: 'Tài khoản', className: 'tabular text-right', cell: (b) => `${b.user_count} / ${b.max_users}` },
    { key: 'devices', header: 'Thiết bị', className: 'tabular text-right', cell: (b) => b.device_count },
  ];
  return <DataTable columns={columns} rows={q.data ?? []} rowKey={(b) => b.enterprise_id} isPending={q.isPending} error={q.error} emptyText="Chưa có chi nhánh." onRowClick={(b) => router.push(`/doanh-nghiep/${b.enterprise_id}`)} />;
}
