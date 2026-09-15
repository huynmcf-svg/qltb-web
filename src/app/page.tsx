import { redirect } from 'next/navigation';

/**
 * Trang gốc chỉ điều hướng. Phiên giữ trong bộ nhớ client nên server không
 * biết đã đăng nhập hay chưa — luôn về /login; login xong tự chuyển /thiet-bi.
 */
export default function RootPage() {
  redirect('/login');
}
