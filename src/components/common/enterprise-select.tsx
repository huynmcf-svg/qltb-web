'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllEnterprises } from '@/hooks/use-enterprises';

const ALL = '__all__';

/** Select doanh nghiệp (tối đa 200). `allowAll` thêm lựa chọn "Tất cả" trả về ''. */
export function EnterpriseSelect({ value, onChange, allowAll, placeholder, onlyRoot, className }: { value: string; onChange: (v: string) => void; allowAll?: boolean; placeholder?: string; onlyRoot?: boolean; className?: string }) {
  const { data } = useAllEnterprises();
  const items = (data ?? []).filter((e) => !onlyRoot || e.parent_id === null);
  return (
    <Select value={value || (allowAll ? ALL : '')} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
      <SelectTrigger className={className ?? 'w-56'}><SelectValue placeholder={placeholder ?? 'Doanh nghiệp'} /></SelectTrigger>
      <SelectContent>
        {allowAll && <SelectItem value={ALL}>Tất cả doanh nghiệp</SelectItem>}
        {items.map((e) => (
          <SelectItem key={e.enterprise_id} value={e.enterprise_id}>{e.parent_id ? `↳ ${e.name}` : e.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
