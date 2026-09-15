import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountPanel } from '@/components/account/account-panel';
import { PageHeader } from '@/components/common/page-header';

export const metadata: Metadata = { title: 'Tài khoản' };

export default function AccountPage() {
  return (
    <>
      <PageHeader title="Tài khoản" />
      <Suspense><AccountPanel /></Suspense>
    </>
  );
}
