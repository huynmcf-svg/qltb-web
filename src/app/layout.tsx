import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/components/common/app-providers';
import { Toaster } from '@/components/ui/sonner';
import { APP_NAME } from '@/lib/api/config';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Quản lý thiết bị`,
    template: `%s · ${APP_NAME}`,
  },
  description: 'Hệ thống quản lý thiết bị',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
