import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { EnterpriseTable } from '@/components/enterprises/enterprise-table';

export const metadata: Metadata = { title: 'Doanh nghiệp' };

export default function EnterprisesPage() {
  return (
    <>
      <PageHeader title="Doanh nghiệp" description="Doanh nghiệp và chi nhánh sử dụng thiết bị. Mỗi doanh nghiệp có hạn mức tài khoản riêng." />
      <EnterpriseTable />
    </>
  );
}
