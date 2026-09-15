import { useId } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Logo QLTB: khối vuông bo góc, gradient xanh, bên trong là ba "thẻ thiết bị"
 * xếp chồng — gợi kho thiết bị đang được kiểm kê. SVG thuần, không phụ thuộc.
 *
 * `useId` cho id gradient: trang login render logo HAI lần (panel trái ẩn dưới
 * lg + header mobile). Trùng id thì bản hiển thị trỏ vào gradient nằm trong
 * khối `display:none` và biến mất.
 */
export function BrandMark({ className }: { className?: string }) {
  const id = useId();
  const bg = `${id}-bg`;
  const card = `${id}-card`;

  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={cn('size-12', className)}>
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="64" y2="64">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id={card} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#dbeafe" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${bg})`} />
      <rect x="14" y="30" width="36" height="20" rx="4" fill="#ffffff" fillOpacity="0.22" />
      <rect x="14" y="23" width="36" height="20" rx="4" fill="#ffffff" fillOpacity="0.45" />
      <rect x="14" y="16" width="36" height="20" rx="4" fill={`url(#${card})`} />
      <rect x="19" y="21" width="12" height="3" rx="1.5" fill="#1e3a8a" fillOpacity="0.7" />
      <rect x="19" y="27" width="20" height="3" rx="1.5" fill="#1e3a8a" fillOpacity="0.35" />
      <circle cx="43" cy="22.5" r="2.5" fill="#22c55e" />
    </svg>
  );
}
