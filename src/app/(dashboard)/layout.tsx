import { AppSidebar } from '@/components/common/app-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-6">{children}</main>
    </div>
  );
}
