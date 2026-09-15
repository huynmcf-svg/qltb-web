'use client';

import { Building2, Download, Gauge, Package } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { EnterpriseSelect } from '@/components/common/enterprise-select';
import { Field } from '@/components/common/field';
import { PageHeader } from '@/components/common/page-header';
import { useSession } from '@/components/common/session-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { downloadReport } from '@/lib/api/reports';
import { todayYmd } from '@/lib/utils/date';

export default function ReportsPage() {
  const { user } = useSession();
  const [enterprise, setEnterprise] = useState('');
  const [from, setFrom] = useState(() => new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => todayYmd());
  const [busy, setBusy] = useState<string | null>(null);

  async function run(kind: 'devices' | 'quota' | 'enterprises') {
    setBusy(kind);
    try {
      await downloadReport(kind, kind === 'quota' ? { from: `${from}T00:00:00Z`, to: `${to}T23:59:59Z`, enterprise_id: enterprise || undefined } : { enterprise_id: enterprise || undefined });
      toast.success('Đã tải báo cáo');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Xuất thất bại'); }
    finally { setBusy(null); }
  }

  return (
    <>
      <PageHeader title="Báo cáo" description="Xuất Excel (.xlsx). Tối đa 5.000 dòng mỗi báo cáo, theo phạm vi của bạn." />
      <div className="mb-4 flex flex-wrap items-end gap-3">
        {user?.enterprise_id === null && <Field label="Doanh nghiệp"><EnterpriseSelect value={enterprise} onChange={setEnterprise} allowAll /></Field>}
        <Field label="Từ ngày" htmlFor="from"><Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" /></Field>
        <Field label="Đến ngày" htmlFor="to"><Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" /></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { kind: 'devices' as const, icon: Package, title: 'Danh sách thiết bị', desc: 'Serial, loại, doanh nghiệp, trạng thái, lần cuối thấy.' },
          { kind: 'quota' as const, icon: Gauge, title: 'Báo cáo sản lượng', desc: 'Ba sheet: sản lượng từng máy, lượt cấp và lượt dùng trong khoảng ngày.' },
          { kind: 'enterprises' as const, icon: Building2, title: 'Danh sách doanh nghiệp', desc: 'Mã, tên, liên hệ, hạn mức, số thiết bị.' },
        ].map(({ kind, icon: Icon, title, desc }) => (
          <Card key={kind}>
            <CardHeader><span className="mb-2 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span><CardTitle>{title}</CardTitle><CardDescription>{desc}</CardDescription></CardHeader>
            <CardContent><Button onClick={() => run(kind)} disabled={busy !== null}><Download />{busy === kind ? 'Đang xuất…' : 'Xuất Excel'}</Button></CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
