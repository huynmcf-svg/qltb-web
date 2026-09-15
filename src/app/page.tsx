import { redirect } from 'next/navigation';

/** Trang gốc chỉ điều hướng. Khi có auth, chưa đăng nhập thì về /login. */
export default function RootPage() {
  redirect('/thiet-bi');
}
