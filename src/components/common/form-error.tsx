'use client';

import { TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Lỗi hiện NGAY TẠI CHỖ trong form, không chỉ bằng toast — toast tự biến mất,
 * người dùng cần đọc lại được lý do.
 */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="border-danger/30 bg-danger/5">
      <TriangleAlert />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
