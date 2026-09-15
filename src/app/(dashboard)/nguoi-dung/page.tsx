import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { UserTable } from '@/components/users/user-table';

export const metadata: Metadata = { title: 'Người dùng' };

export default function UsersPage() {
  return (
    <>
      <PageHeader title="Người dùng" description="Tài khoản đăng nhập hệ thống. Mỗi doanh nghiệp có hạn mức tài khoản riêng; vai trò quyết định quyền." />
      <UserTable />
    </>
  );
}
