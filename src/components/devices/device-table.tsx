'use client';

import { useState } from 'react';
import { DeviceStatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounced } from '@/hooks/use-debounced';
import { useDevices } from '@/hooks/use-devices';
import { describeError } from '@/lib/utils/errors';
import { formatDate } from '@/lib/utils/date';

export function DeviceTable() {
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q, 300);
  const query = useDevices(debouncedQ ? { q: debouncedQ } : {});

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-3">
      <Input
        placeholder="Tìm theo mã, tên, serial…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />

      {query.isError && (
        <p className="text-sm text-danger">{describeError(query.error)}</p>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Người giữ</TableHead>
              <TableHead>Ngày mua</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isPending && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Đang tải…
                </TableCell>
              </TableRow>
            )}
            {!query.isPending && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Chưa có thiết bị nào.
                </TableCell>
              </TableRow>
            )}
            {items.map((d) => (
              <TableRow key={d.device_id}>
                <TableCell className="font-mono">{d.code}</TableCell>
                <TableCell>{d.name}</TableCell>
                <TableCell>{d.category_name}</TableCell>
                <TableCell>
                  <DeviceStatusBadge status={d.status} />
                </TableCell>
                <TableCell>{d.holder_name ?? '—'}</TableCell>
                <TableCell className="tabular">{formatDate(d.purchased_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {query.hasNextPage && (
        <Button
          variant="outline"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
        >
          {query.isFetchingNextPage ? 'Đang tải…' : 'Tải thêm'}
        </Button>
      )}
    </div>
  );
}
