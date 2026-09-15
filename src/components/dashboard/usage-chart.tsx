'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { UsagePoint } from '@/types/dashboard';
import { formatNumber } from '@/lib/utils/date';

/** Biểu đồ sản lượng theo ngày. Màu lấy từ token CSS để hợp cả light/dark. */
export function UsageChart({ points }: { points: UsagePoint[] }) {
  const data = points.map((p) => ({ ...p, label: p.bucket.slice(5).replace('-', '/') }));
  if (!data.length) return <div className="grid h-64 place-items-center text-sm text-muted-foreground">Chưa có lượt sử dụng trong khoảng này.</div>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="usage-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={48} tickFormatter={(v: number) => formatNumber(v)} />
          <Tooltip
            contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: 'var(--muted-foreground)' }}
            formatter={(v) => [formatNumber(Number(v)), 'Lượt dùng']}
          />
          <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={2} fill="url(#usage-fill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
