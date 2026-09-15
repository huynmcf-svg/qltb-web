'use client';

import { Bell, Building2, Gauge, Package, ShieldAlert, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { UsageChart } from '@/components/dashboard/usage-chart';
import { PageHeader } from '@/components/common/page-header';
import { QuotaBar } from '@/components/common/quota-bar';
import { useSession } from '@/components/common/session-provider';
import { StatCard } from '@/components/common/stat-card';
import { DEVICE_STATUS_LABEL, DeviceStatusBadge, OnlineDot } from '@/components/common/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminDashboard, useBusinessDashboard, useExpiringDevices, useUsageChart } from '@/hooks/use-misc';
import { formatDate, formatNumber } from '@/lib/utils/date';
import type { DeviceStatus } from '@/types/device';

const RANGES = { '7d': 7, '30d': 30, '90d': 90 } as const;

export default function OverviewPage() {
  const { user, can } = useSession();
  const isAdmin = user?.enterprise_id === null && can('dashboard.admin');
  const admin = useAdminDashboard(!!isAdmin);
  const business = useBusinessDashboard();
  const expiring = useExpiringDevices();
  const [range, setRange] = useState<keyof typeof RANGES>('30d');
  // Chụp mốc thời gian một lần lúc mount — không gọi Date.now() trong render.
  const [now] = useState(() => Date.now());
  const chart = useUsageChart({ from: new Date(now - RANGES[range] * 86_400_000).toISOString(), granularity: RANGES[range] > 60 ? 'week' : 'day' });

  return (
    <>
      <PageHeader title={`Xin chào, ${user?.full_name ?? ''}`} description={isAdmin ? 'Toàn hệ thống — số liệu tính lúc mở trang.' : `${user?.enterprise_name} — thiết bị và sản lượng của doanh nghiệp bạn.`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isAdmin && admin.data ? (
          <>
            <StatCard label="Doanh nghiệp" value={formatNumber(admin.data.enterprise_count)} icon={Building2} />
            <StatCard label="Thiết bị" value={formatNumber(admin.data.device_count)} hint={`${admin.data.devices_by_status.ACTIVE ?? 0} đang hoạt động · ${admin.data.devices_by_status.IN_STOCK ?? 0} trong kho`} icon={Package} />
            <StatCard label="Sắp hết sản lượng" value={formatNumber(admin.data.devices_quota_low)} hint="dưới ngưỡng cảnh báo" icon={Gauge} tone={admin.data.devices_quota_low > 0 ? 'warning' : 'success'} />
            <StatCard label="Mất kết nối" value={formatNumber(admin.data.devices_offline)} hint={`${admin.data.devices_warranty_expiring} máy sắp hết bảo hành`} icon={WifiOff} tone={admin.data.devices_offline > 0 ? 'danger' : 'success'} />
          </>
        ) : business.data ? (
          <>
            <StatCard label="Thiết bị đang dùng" value={formatNumber(business.data.device_count)} icon={Package} />
            <StatCard label="Sản lượng còn lại" value={formatNumber(business.data.quota_remaining_total)} hint={`đã dùng ${formatNumber(business.data.quota_used_total)}`} icon={Gauge} tone="info" />
            <StatCard label="Máy khoá / offline" value={`${business.data.devices.filter((d) => d.is_locked).length} / ${business.data.devices.filter((d) => !d.is_online).length}`} icon={ShieldAlert} tone="warning" />
            <StatCard label="Thông báo chưa đọc" value={formatNumber(business.data.unread_notifications)} icon={Bell} tone={business.data.unread_notifications > 0 ? 'danger' : 'default'} />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Card key={i} className="h-[84px] animate-pulse" />)
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sản lượng sử dụng</CardTitle>
            <Tabs value={range} onValueChange={(v) => setRange(v as keyof typeof RANGES)}>
              <TabsList>{Object.keys(RANGES).map((k) => <TabsTrigger key={k} value={k}>{k === '7d' ? '7 ngày' : k === '30d' ? '30 ngày' : '90 ngày'}</TabsTrigger>)}</TabsList>
            </Tabs>
          </CardHeader>
          <CardContent><UsageChart points={chart.data ?? []} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Theo trạng thái</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {isAdmin && admin.data ? (
              (Object.keys(DEVICE_STATUS_LABEL) as DeviceStatus[]).map((s) => (
                <div key={s} className="flex items-center justify-between text-sm">
                  <DeviceStatusBadge status={s} />
                  <span className="tabular font-medium">{formatNumber(admin.data!.devices_by_status[s] ?? 0)}</span>
                </div>
              ))
            ) : business.data ? (
              business.data.devices.slice(0, 6).map((d) => (
                <Link key={d.device_id} href={`/thiet-bi/${d.device_id}`} className="block rounded-md p-2 -mx-2 hover:bg-accent">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs">{d.serial_number}</span>
                    <OnlineDot online={d.is_online} lastSeenAt={null} />
                  </div>
                  <QuotaBar total={d.quota_total} remaining={d.quota_remaining} pct={d.remaining_pct} compact />
                </Link>
              ))
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Sắp hết sản lượng</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {expiring.data?.quota_low.length === 0 && <p className="text-sm text-muted-foreground">Không có máy nào dưới 20 %.</p>}
            {expiring.data?.quota_low.slice(0, 6).map((q) => (
              <Link key={q.device_id} href={`/thiet-bi/${q.device_id}`} className="-mx-2 block rounded-md p-2 hover:bg-accent">
                <div className="mb-1 flex items-center justify-between text-sm"><span className="font-mono text-xs">{q.serial_number}</span><span className="text-xs text-muted-foreground">{q.enterprise_name}</span></div>
                <QuotaBar total={q.quota_total} remaining={q.quota_remaining} pct={q.remaining_pct} compact />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sắp hết bảo hành</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {expiring.data?.warranty_expiring.length === 0 && <p className="text-sm text-muted-foreground">Không có bảo hành nào hết trong 30 ngày.</p>}
            {expiring.data?.warranty_expiring.slice(0, 6).map((w) => (
              <Link key={w.warranty_id} href={`/thiet-bi/${w.device_id}`} className="-mx-2 flex items-center justify-between rounded-md p-2 text-sm hover:bg-accent">
                <div><span className="font-mono text-xs">{w.serial_number}</span><span className="ml-2 text-xs text-muted-foreground">{w.enterprise_name}</span></div>
                <div className="text-right"><div className={w.days_remaining <= 7 ? 'font-medium text-danger' : ''}>{w.days_remaining < 0 ? 'Đã quá hạn' : `còn ${w.days_remaining} ngày`}</div><div className="text-xs text-muted-foreground">{formatDate(w.end_date)}</div></div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
