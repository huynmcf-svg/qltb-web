'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppHeader } from '@/components/common/app-header';
import { AppSidebar } from '@/components/common/app-sidebar';
import { useSession } from '@/components/common/session-provider';

/**
 * Khung dashboard: chưa có phiên thì về /login. Trong lúc khôi phục phiên
 * (F5) hiện trống thay vì chớp màn đăng nhập rồi lại nhảy vào.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        {user.must_change_password && (
          <div className="border-b border-warning/40 bg-warning/15 px-6 py-2 text-sm text-warning-foreground">
            Bạn đang dùng mật khẩu tạm. <Link href="/tai-khoan?tab=mat-khau" className="font-medium underline">Đổi mật khẩu ngay</Link>.
          </div>
        )}
        <main className="flex-1 px-6 py-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
