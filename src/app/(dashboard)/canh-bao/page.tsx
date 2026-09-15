import type { Metadata } from 'next';
import { AlertTable } from '@/components/alerts/alert-table';
import { PageHeader } from '@/components/common/page-header';

export const metadata: Metadata = { title: 'Cảnh báo' };

export default function AlertsPage() {
  return (
    <>
      <PageHeader title="Cảnh báo" description="Sản lượng dưới ngưỡng, bảo hành sắp hết, máy mất kết nối. Job quét tự chạy mỗi 10 phút." />
      <AlertTable />
    </>
  );
}
