import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { WarrantyTable } from '@/components/warranties/warranty-table';

export const metadata: Metadata = { title: 'Bảo hành' };

export default function WarrantiesPage() {
  return (
    <>
      <PageHeader title="Bảo hành" description="Sắp hết hạn lên đầu. Bảo hành tự tạo khi gán máy; gia hạn ở từng dòng." />
      <WarrantyTable />
    </>
  );
}
