import { Bell, Building2, ClipboardList, FileSpreadsheet, Gauge, LayoutDashboard, Package, Repeat, ShieldCheck, UserCog, Users, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Cần MỘT trong các quyền này. Rỗng = ai cũng thấy. */
  anyOf?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Menu gom một chỗ. Thêm màn mới thì thêm dòng ở đây; sidebar và tiêu đề header đọc từ đây. */
export const NAV_GROUPS: NavGroup[] = [
  { label: '', items: [{ href: '/tong-quan', label: 'Tổng quan', icon: LayoutDashboard }] },
  {
    label: 'Vận hành',
    items: [
      { href: '/thiet-bi', label: 'Thiết bị', icon: Package, anyOf: ['device.read'] },
      { href: '/doanh-nghiep', label: 'Doanh nghiệp', icon: Building2, anyOf: ['enterprise.read'] },
      { href: '/san-luong', label: 'Sản lượng', icon: Gauge, anyOf: ['quota.read'] },
      { href: '/bao-hanh', label: 'Bảo hành', icon: ShieldCheck, anyOf: ['warranty.read'] },
      { href: '/doi-tra', label: 'Đổi trả', icon: Repeat, anyOf: ['exchange.read'] },
    ],
  },
  {
    label: 'Giám sát',
    items: [
      { href: '/canh-bao', label: 'Cảnh báo', icon: Bell, anyOf: ['alert.read'] },
      { href: '/nhat-ky', label: 'Nhật ký', icon: ClipboardList, anyOf: ['audit.read'] },
    ],
  },
  {
    label: 'Quản trị',
    items: [
      { href: '/nguoi-dung', label: 'Người dùng', icon: Users, anyOf: ['user.read'] },
      { href: '/vai-tro', label: 'Vai trò', icon: UserCog, anyOf: ['role.read'] },
      { href: '/bao-cao', label: 'Báo cáo', icon: FileSpreadsheet, anyOf: ['report.export'] },
    ],
  },
];

export function findNav(pathname: string): NavItem | undefined {
  return NAV_GROUPS.flatMap((g) => g.items).find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
}
