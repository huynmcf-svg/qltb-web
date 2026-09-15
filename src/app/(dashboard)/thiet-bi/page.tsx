import type { Metadata } from 'next';
import { DeviceTable } from '@/components/devices/device-table';

export const metadata: Metadata = { title: 'Thiết bị' };

export default function DevicesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Thiết bị</h1>
        <p className="text-sm text-muted-foreground">Hồ sơ và trạng thái hiện tại của từng thiết bị.</p>
      </div>
      <DeviceTable />
    </div>
  );
}
