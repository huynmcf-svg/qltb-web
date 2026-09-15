import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { ExchangeTable } from '@/components/exchanges/exchange-table';

export const metadata: Metadata = { title: 'Đổi trả' };

export default function ExchangesPage() {
  return (
    <>
      <PageHeader title="Đổi trả máy" description="Doanh nghiệp gửi yêu cầu, quản trị duyệt và gán máy mới. Bảo hành và sản lượng còn lại đi theo máy mới." />
      <ExchangeTable />
    </>
  );
}
