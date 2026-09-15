import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { DeviceTable } from '@/components/devices/device-table';

export const metadata: Metadata = { title: 'Thiết bị' };

export default function DevicesPage() {
  return (
    <>
      <PageHeader title="Thiết bị" description="Toàn bộ máy trong kho và đã gán cho doanh nghiệp. Bấm vào một máy để xem sản lượng, bảo hành, lượt dùng." />
      <DeviceTable />
    </>
  );
}
