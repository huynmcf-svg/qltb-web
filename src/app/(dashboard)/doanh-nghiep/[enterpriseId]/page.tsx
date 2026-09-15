import type { Metadata } from 'next';
import { EnterpriseDetail } from '@/components/enterprises/enterprise-detail';

export const metadata: Metadata = { title: 'Chi tiết doanh nghiệp' };

export default async function EnterpriseDetailPage({ params }: { params: Promise<{ enterpriseId: string }> }) {
  const { enterpriseId } = await params;
  return <EnterpriseDetail enterpriseId={enterpriseId} />;
}
