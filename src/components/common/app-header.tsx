'use client';

import { Bell, KeyRound, LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUnreadCount } from '@/hooks/use-misc';
import { findNav } from '@/lib/nav';
import { NotificationBell } from './notification-bell';
import { useSession } from './session-provider';

export function AppHeader() {
  const { user, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const nav = findNav(pathname);
  const unread = useUnreadCount();

  async function onLogout() {
    await logout();
    router.replace('/login');
  }

  const initials = (user?.full_name ?? '?').split(' ').filter(Boolean).slice(-2).map((s) => s[0]?.toUpperCase()).join('');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/85 px-6 backdrop-blur">
      <div className="text-sm font-medium text-muted-foreground">{nav?.label ?? ''}</div>
      <div className="flex items-center gap-1.5">
        <NotificationBell count={unread.data ?? 0}>
          <Button variant="ghost" size="icon-sm" aria-label="Thông báo" className="relative">
            <Bell />
            {(unread.data ?? 0) > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-danger-foreground">
                {Math.min(unread.data ?? 0, 99)}
              </span>
            )}
          </Button>
        </NotificationBell>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-md py-1 pl-1.5 pr-2 hover:bg-accent">
              <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials}</span>
              <span className="hidden text-left leading-tight md:block">
                <span className="block text-sm font-medium">{user?.full_name}</span>
                <span className="block text-[11px] text-muted-foreground">{user?.roles.join(', ')}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="text-sm font-medium">{user?.full_name}</div>
              <div className="text-xs text-muted-foreground">@{user?.username}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/tai-khoan"><UserRound />Tài khoản</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/tai-khoan?tab=mat-khau"><KeyRound />Đổi mật khẩu</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} variant="destructive"><LogOut />Đăng xuất</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
