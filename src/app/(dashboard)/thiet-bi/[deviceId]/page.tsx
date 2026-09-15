import type { Metadata } from 'next';
import { DeviceDetail } from '@/components/devices/device-detail';

export const metadata: Metadata = { title: 'Chi tiết thiết bị' };

export default async function DeviceDetailPage({ params }: { params: Promise<{ deviceId: string }> }) {
  const { deviceId } = await params;
  return <DeviceDetail deviceId={deviceId} />;
}
