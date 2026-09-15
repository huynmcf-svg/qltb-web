import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export function StatCard({ label, value, hint, icon: Icon, tone = 'default' }: { label: string; value: string | number; hint?: string; icon: LucideIcon; tone?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const toneClass = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/20 text-warning-foreground',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/15 text-info',
  }[tone];
  return (
    <Card className="flex flex-row items-center gap-4 p-4">
      <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', toneClass)}><Icon className="size-5" /></span>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold tabular tracking-tight">{value}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
    </Card>
  );
}
