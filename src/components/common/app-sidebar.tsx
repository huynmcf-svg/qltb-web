'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME } from '@/lib/api/config';
import { NAV_GROUPS } from '@/lib/nav';
import { cn } from '@/lib/utils/cn';
import { BrandMark } from './brand-mark';
import { useSession } from './session-provider';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, can } = useSession();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <Link href="/tong-quan" className="flex items-center gap-3 px-5 py-5">
        <BrandMark className="size-9" />
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">{APP_NAME}</div>
          <div className="text-[11px] text-sidebar-foreground/55">Quản lý thiết bị</div>
        </div>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((i) => !i.anyOf || i.anyOf.some(can));
          if (!items.length) return null;
          return (
            <div key={group.label || 'root'}>
              {group.label && <div className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">{group.label}</div>}
              <div className="space-y-0.5">
                {items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] transition-colors',
                        active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      )}
                    >
                      <Icon className={cn('size-4', active ? '' : 'text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground')} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-3 text-[11px] text-sidebar-foreground/45">
        {user?.enterprise_name ?? 'Quản trị hệ thống'}
      </div>
    </aside>
  );
}
