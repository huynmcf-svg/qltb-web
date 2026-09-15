'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { describeError } from '@/lib/utils/errors';
import { cn } from '@/lib/utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isPending?: boolean;
  error?: unknown;
  emptyText?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onRowClick?: (row: T) => void;
}

/** Bảng + trạng thái tải / lỗi / rỗng + nút "Tải thêm" cho cursor pagination. */
export function DataTable<T>({ columns, rows, rowKey, isPending, error, emptyText = 'Chưa có dữ liệu.', hasNextPage, isFetchingNextPage, onLoadMore, onRowClick }: DataTableProps<T>) {
  return (
    <div className="space-y-3">
      {error ? <p className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{describeError(error)}</p> : null}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((c) => <TableHead key={c.key} className={cn('whitespace-nowrap', c.className)}>{c.header}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && (
              <TableRow><TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground"><Loader2 className="mr-2 inline size-4 animate-spin" />Đang tải…</TableCell></TableRow>
            )}
            {!isPending && rows.length === 0 && (
              <TableRow><TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">{emptyText}</TableCell></TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={rowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined} className={cn(onRowClick && 'cursor-pointer')}>
                {columns.map((c) => <TableCell key={c.key} className={c.className}>{c.cell(row)}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isFetchingNextPage}>{isFetchingNextPage ? 'Đang tải…' : 'Tải thêm'}</Button>
        </div>
      )}
    </div>
  );
}
