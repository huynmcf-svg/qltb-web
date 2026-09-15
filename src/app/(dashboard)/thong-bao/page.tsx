'use client';

import { CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/page-header';
import { SeverityDot } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { useMarkRead, useNotifications, useReadAll } from '@/hooks/use-misc';
import { cn } from '@/lib/utils/cn';
import { formatRelative } from '@/lib/utils/date';

export default function NotificationsPage() {
  const list = useNotifications();
  const markRead = useMarkRead();
  const readAll = useReadAll();
  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <>
      <PageHeader title="Thông báo" description="Cảnh báo gửi tới bạn." actions={<Button variant="outline" onClick={() => readAll.mutate()} disabled={readAll.isPending}><CheckCheck />Đánh dấu tất cả đã đọc</Button>} />
      <div className="divide-y rounded-lg border bg-card">
        {list.isPending && <div className="p-8 text-center text-muted-foreground">Đang tải…</div>}
        {!list.isPending && items.length === 0 && <div className="p-8 text-center text-muted-foreground">Chưa có thông báo.</div>}
        {items.map((n) => (
          <Link key={n.notification_id} href={`/thiet-bi/${n.alert.device_id}`} onClick={() => !n.read_at && markRead.mutate(n.notification_id)} className={cn('flex gap-3 px-4 py-3 hover:bg-accent', !n.read_at && 'bg-primary/[0.04]')}>
            <SeverityDot severity={n.alert.severity} className="mt-2" />
            <div className="min-w-0 flex-1">
              <div className={cn('text-sm', !n.read_at && 'font-medium')}>{n.title} <span className="font-mono text-xs text-muted-foreground">{n.alert.serial_number}</span></div>
              <div className="text-sm text-muted-foreground">{n.body}</div>
              <div className="mt-0.5 text-xs text-muted-foreground/70">{formatRelative(n.created_at)}</div>
            </div>
          </Link>
        ))}
      </div>
      {list.hasNextPage && <div className="mt-3 flex justify-center"><Button variant="outline" size="sm" onClick={() => list.fetchNextPage()} disabled={list.isFetchingNextPage}>Tải thêm</Button></div>}
    </>
  );
}
