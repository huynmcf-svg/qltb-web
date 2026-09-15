import type { Metadata } from 'next';
import { AuditTable } from '@/components/audit/audit-table';
import { PageHeader } from '@/components/common/page-header';

export const metadata: Metadata = { title: 'Nhật ký' };

export default function AuditPage() {
  return (
    <>
      <PageHeader title="Nhật ký thao tác" description="Ai làm gì, lúc nào, giá trị trước / sau. Bấm một dòng để xem chi tiết." />
      <AuditTable />
    </>
  );
}
