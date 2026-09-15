import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { LoginShowcase } from '@/components/auth/login-showcase';
import { BrandMark } from '@/components/common/brand-mark';
import { APP_NAME } from '@/lib/api/config';

export const metadata: Metadata = { title: 'Đăng nhập' };

/**
 * Bố cục hai cột: trái là panel thương hiệu (ẩn dưới lg), phải là form.
 * Trang này là server component; phần tương tác nằm trong `LoginForm`.
 */
export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <LoginShowcase />

      <section className="relative flex items-center justify-center px-5 py-12 sm:px-8">
        {/* Nền nhẹ cho cột form — chấm mờ để không trơ. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 qltb-dots opacity-[0.35]" />

        <div className="relative w-full max-w-[24rem]">
          {/* Nhận diện gọn cho màn hình nhỏ — panel trái đã ẩn. */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark className="size-10" />
            <div>
              <div className="font-semibold tracking-tight">{APP_NAME}</div>
              <div className="text-xs text-muted-foreground">Quản lý thiết bị</div>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Dùng tài khoản do quản trị viên cấp.
          </p>

          <div className="mt-7">
            <LoginForm />
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link href="/quen-mat-khau" className="font-medium text-primary hover:underline">Quên mật khẩu?</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
