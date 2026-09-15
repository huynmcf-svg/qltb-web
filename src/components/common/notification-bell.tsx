'use client';

import { CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMarkRead, useNotifications, useReadAll } from '@/hooks/use-misc';
import { formatRelative } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { SeverityDot } from './status-badge';

export function NotificationBell({ count, children }: { count: number; children: React.ReactNode }) {
  const list = useNotifications();
  const markRead = useMarkRead();
  const readAll = useReadAll();
  const items = list.data?.pages.flatMap((p) => p.items).slice(0, 8) ?? [];

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <div className="text-sm font-medium">Thông báo {count > 0 && <span className="text-muted-foreground">· {count} chưa đọc</span>}</div>
          <Button variant="ghost" size="xs" onClick={() => readAll.mutate()} disabled={count === 0 || readAll.isPending}><CheckCheck />Đọc hết</Button>
        </div>
        <div className="max-h-[22rem] overflow-y-auto">
          {items.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">Chưa có thông báo.</div>}
          {items.map((n) => (
            <Link
              key={n.notification_id}
              href={`/thiet-bi/${n.alert.device_id}`}
              onClick={() => !n.read_at && markRead.mutate(n.notification_id)}
              className={cn('flex gap-3 border-b px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-accent', !n.read_at && 'bg-primary/[0.04]')}
            >
              <SeverityDot severity={n.alert.severity} className="mt-1.5" />
              <div className="min-w-0 flex-1">
                <div className={cn('truncate', !n.read_at && 'font-medium')}>{n.title}</div>
                <div className="line-clamp-2 text-xs text-muted-foreground">{n.body}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground/70">{formatRelative(n.created_at)}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="border-t px-4 py-2 text-center">
          <Link href="/thong-bao" className="text-xs font-medium text-primary hover:underline">Xem tất cả</Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
