import { Badge } from '@/components/ui/badge';
import type { DeviceStatus } from '@/types/device';

/**
 * Nhãn + màu trạng thái thiết bị — MỘT chỗ duy nhất. Bốn trạng thái là bốn màu
 * cố định, không tự chọn màu ở từng màn (docs/rules/frontend-structure.md).
 */
export const DEVICE_STATUS_LABEL: Record<DeviceStatus, string> = {
  IN_STOCK: 'Trong kho',
  IN_USE: 'Đang sử dụng',
  UNDER_MAINTENANCE: 'Đang bảo trì',
  DISPOSED: 'Đã thanh lý',
};

const STYLE: Record<DeviceStatus, string> = {
  IN_STOCK: 'bg-info/15 text-info border-info/30',
  IN_USE: 'bg-success/15 text-success border-success/30',
  UNDER_MAINTENANCE: 'bg-warning/20 text-warning-foreground border-warning/40',
  DISPOSED: 'bg-muted text-muted-foreground border-border',
};

export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  return (
    <Badge variant="outline" className={STYLE[status]}>
      {DEVICE_STATUS_LABEL[status]}
    </Badge>
  );
}
