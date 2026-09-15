import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { QuotaTable } from '@/components/quotas/quota-table';

export const metadata: Metadata = { title: 'Sản lượng' };

export default function QuotasPage() {
  return (
    <>
      <PageHeader title="Sản lượng" description="Tổng / đã dùng / còn lại của từng máy. Máy về 0 tự khoá; cấp thêm sẽ tự mở." />
      <QuotaTable />
    </>
  );
}
