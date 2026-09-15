'use client';

import { Boxes, Package, Wrench } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME } from '@/lib/api/config';
import { cn } from '@/lib/utils/cn';

/** Menu gom một chỗ. Thêm màn mới thì thêm dòng ở đây. */
const NAV = [
  { href: '/thiet-bi', label: 'Thiết bị', icon: Package },
  { href: '/loai-thiet-bi', label: 'Loại thiết bị', icon: Boxes },
  { href: '/bao-tri', label: 'Bảo trì', icon: Wrench },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5 text-lg font-semibold tracking-tight">{APP_NAME}</div>
      <nav className="flex flex-col gap-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
