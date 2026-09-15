'use client';

import { Checkbox } from '@/components/ui/checkbox';
import type { Permission } from '@/types/user';

const GROUP_LABEL: Record<string, string> = { user: 'Người dùng & vai trò', enterprise: 'Doanh nghiệp', device: 'Thiết bị', warranty: 'Bảo hành', quota: 'Sản lượng', alert: 'Cảnh báo', exchange: 'Đổi trả', report: 'Dashboard & báo cáo', audit: 'Nhật ký' };

/** Ma trận tick quyền theo nhóm. `readOnly` cho vai trò hệ thống. */
export function PermissionMatrix({ permissions, selected, onChange, readOnly }: { permissions: Permission[]; selected: string[]; onChange?: (codes: string[]) => void; readOnly?: boolean }) {
  const groups = [...new Set(permissions.map((p) => p.group))];
  const toggle = (code: string, on: boolean) => onChange?.(on ? [...selected, code] : selected.filter((c) => c !== code));
  const toggleGroup = (group: string, on: boolean) => {
    const codes = permissions.filter((p) => p.group === group).map((p) => p.code);
    onChange?.(on ? [...new Set([...selected, ...codes])] : selected.filter((c) => !codes.includes(c)));
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {groups.map((g) => {
        const items = permissions.filter((p) => p.group === g);
        const allOn = items.every((p) => selected.includes(p.code));
        return (
          <div key={g} className="rounded-lg border p-3">
            <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm font-medium">
              {!readOnly && <Checkbox checked={allOn} onCheckedChange={(c) => toggleGroup(g, !!c)} />}
              {GROUP_LABEL[g] ?? g}
            </label>
            <div className="space-y-1.5">
              {items.map((p) => (
                <label key={p.code} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={selected.includes(p.code)} disabled={readOnly} onCheckedChange={(c) => toggle(p.code, !!c)} />
                  <span>{p.name}</span>
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground">{p.code}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
