import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { AlertSeverity } from '@/types/alert';
import type { DeviceStatus, WarrantyStatus } from '@/types/device';
import type { EnterpriseStatus } from '@/types/enterprise';
import type { ExchangeStatus } from '@/types/exchange';
import type { UserStatus } from '@/types/user';

/**
 * Nhãn + màu trạng thái — MỘT chỗ duy nhất cho toàn bộ hệ thống
 * (docs/rules/frontend-structure.md). Không tự chọn màu ở từng màn.
 */
export const DEVICE_STATUS_LABEL: Record<DeviceStatus, string> = {
  IN_STOCK: 'Trong kho',
  ACTIVE: 'Đang hoạt động',
  LOCKED: 'Đã khoá',
  EXCHANGED: 'Đã đổi trả',
  RETIRED: 'Đã thanh lý',
};
const DEVICE_STYLE: Record<DeviceStatus, string> = {
  IN_STOCK: 'bg-info/15 text-info border-info/30',
  ACTIVE: 'bg-success/15 text-success border-success/30',
  LOCKED: 'bg-danger/10 text-danger border-danger/30',
  EXCHANGED: 'bg-warning/20 text-warning-foreground border-warning/40',
  RETIRED: 'bg-muted text-muted-foreground border-border',
};
export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  return <Badge variant="outline" className={DEVICE_STYLE[status]}>{DEVICE_STATUS_LABEL[status]}</Badge>;
}

export const ENTERPRISE_STATUS_LABEL: Record<EnterpriseStatus, string> = { ACTIVE: 'Hoạt động', SUSPENDED: 'Đình chỉ' };
export function EnterpriseStatusBadge({ status }: { status: EnterpriseStatus }) {
  return <Badge variant="outline" className={status === 'ACTIVE' ? 'bg-success/15 text-success border-success/30' : 'bg-danger/10 text-danger border-danger/30'}>{ENTERPRISE_STATUS_LABEL[status]}</Badge>;
}

export const USER_STATUS_LABEL: Record<UserStatus, string> = { ACTIVE: 'Hoạt động', DISABLED: 'Đã khoá' };
export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge variant="outline" className={status === 'ACTIVE' ? 'bg-success/15 text-success border-success/30' : 'bg-muted text-muted-foreground border-border'}>{USER_STATUS_LABEL[status]}</Badge>;
}

export const WARRANTY_STATUS_LABEL: Record<WarrantyStatus, string> = { ACTIVE: 'Còn hạn', EXPIRED: 'Hết hạn', TRANSFERRED: 'Đã chuyển', VOID: 'Đã huỷ' };
const WARRANTY_STYLE: Record<WarrantyStatus, string> = {
  ACTIVE: 'bg-success/15 text-success border-success/30',
  EXPIRED: 'bg-danger/10 text-danger border-danger/30',
  TRANSFERRED: 'bg-info/15 text-info border-info/30',
  VOID: 'bg-muted text-muted-foreground border-border',
};
export function WarrantyStatusBadge({ status }: { status: WarrantyStatus }) {
  return <Badge variant="outline" className={WARRANTY_STYLE[status]}>{WARRANTY_STATUS_LABEL[status]}</Badge>;
}

export const EXCHANGE_STATUS_LABEL: Record<ExchangeStatus, string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối' };
const EXCHANGE_STYLE: Record<ExchangeStatus, string> = {
  PENDING: 'bg-warning/20 text-warning-foreground border-warning/40',
  APPROVED: 'bg-success/15 text-success border-success/30',
  REJECTED: 'bg-danger/10 text-danger border-danger/30',
};
export function ExchangeStatusBadge({ status }: { status: ExchangeStatus }) {
  return <Badge variant="outline" className={EXCHANGE_STYLE[status]}>{EXCHANGE_STATUS_LABEL[status]}</Badge>;
}

export const SEVERITY_LABEL: Record<AlertSeverity, string> = { INFO: 'Thông tin', WARNING: 'Cảnh báo', CRITICAL: 'Nghiêm trọng' };
const SEVERITY_DOT: Record<AlertSeverity, string> = { INFO: 'bg-info', WARNING: 'bg-warning', CRITICAL: 'bg-danger' };
export function SeverityDot({ severity, className }: { severity: AlertSeverity; className?: string }) {
  return <span className={cn('inline-block size-2 shrink-0 rounded-full', SEVERITY_DOT[severity], className)} title={SEVERITY_LABEL[severity]} />;
}
export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const style = { INFO: 'bg-info/15 text-info border-info/30', WARNING: 'bg-warning/20 text-warning-foreground border-warning/40', CRITICAL: 'bg-danger/10 text-danger border-danger/30' }[severity];
  return <Badge variant="outline" className={style}>{SEVERITY_LABEL[severity]}</Badge>;
}

/** Chấm online/offline — chiều kết nối, độc lập với `status`. */
export function OnlineDot({ online, lastSeenAt }: { online: boolean; lastSeenAt: string | null }) {
  const title = online ? 'Đang kết nối' : lastSeenAt ? 'Mất kết nối' : 'Chưa từng kết nối';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" title={title}>
      <span className={cn('size-2 rounded-full', online ? 'bg-success shadow-[0_0_6px_var(--success)]' : 'bg-muted-foreground/40')} />
      {title}
    </span>
  );
}
