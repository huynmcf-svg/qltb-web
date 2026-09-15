import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

/** Thanh sản lượng còn lại — màu theo ngưỡng (≥20 % xanh, <20 vàng, <10 đỏ). */
export function QuotaBar({ total, remaining, pct, compact }: { total: number; remaining: number; pct: number | null; compact?: boolean }) {
  const tone = pct === null ? 'bg-muted-foreground/40' : pct < 10 ? 'bg-danger' : pct < 20 ? 'bg-warning' : 'bg-success';
  return (
    <div className={cn('min-w-[9rem]', compact ? 'space-y-0.5' : 'space-y-1')}>
      <div className="flex items-baseline justify-between text-xs">
        <span className="tabular font-medium">{formatNumber(remaining)}<span className="text-muted-foreground"> / {formatNumber(total)}</span></span>
        <span className={cn('tabular', pct !== null && pct < 20 ? 'font-medium text-danger' : 'text-muted-foreground')}>{pct === null ? '—' : `${pct} %`}</span>
      </div>
      <Progress value={pct ?? 0} indicatorClassName={tone} className="h-1.5" />
    </div>
  );
}
