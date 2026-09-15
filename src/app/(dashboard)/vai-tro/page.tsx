import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { RoleManager } from '@/components/roles/role-manager';

export const metadata: Metadata = { title: 'Vai trò' };

export default function RolesPage() {
  return (
    <>
      <PageHeader title="Vai trò & quyền" description="Ma trận quyền là dữ liệu — đổi ở đây có hiệu lực ngay, không cần triển khai lại." />
      <RoleManager />
    </>
  );
}
