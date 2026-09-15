import { ClipboardCheck, History, ShieldCheck } from 'lucide-react';
import { BrandMark } from '@/components/common/brand-mark';
import { APP_NAME } from '@/lib/api/config';

/**
 * Panel thương hiệu bên trái màn đăng nhập.
 *
 * Toàn bộ phần trang trí là `aria-hidden` + `pointer-events-none`. Các "thẻ
 * thiết bị" nổi dùng vị trí CỐ ĐỊNH chứ không `Math.random()` — giá trị ngẫu
 * nhiên khác nhau giữa server và client sẽ gây lỗi hydration.
 */
const HIGHLIGHTS = [
  {
    icon: ClipboardCheck,
    title: 'Hồ sơ đầy đủ',
    text: 'Mã, serial, ngày mua, bảo hành — tra cứu trong vài giây.',
  },
  {
    icon: History,
    title: 'Lịch sử không mất',
    text: 'Mỗi lần cấp, thu hồi, bảo trì đều ghi lại. Không sửa, không xoá.',
  },
  {
    icon: ShieldCheck,
    title: 'Trạng thái rõ ràng',
    text: 'Trong kho · Đang dùng · Bảo trì · Thanh lý — biết ngay ai giữ gì.',
  },
] as const;

/* Thẻ chỉ nằm ở nửa PHẢI panel (left ≥ 58%) để không đè lên khối chữ bên trái. */
const FLOATING_CARDS = [
  { top: '10%', left: '62%', code: 'LT-0042', label: 'Laptop', status: 'Đang dùng', tone: 'success', delay: '0s' },
  { top: '32%', left: '74%', code: 'MN-0117', label: 'Màn hình', status: 'Trong kho', tone: 'info', delay: '1.6s' },
  { top: '54%', left: '60%', code: 'PR-0009', label: 'Máy in', status: 'Bảo trì', tone: 'warning', delay: '3.1s' },
  { top: '76%', left: '72%', code: 'NW-0003', label: 'Switch 24p', status: 'Đang dùng', tone: 'success', delay: '0.9s' },
] as const;

const TONE: Record<(typeof FLOATING_CARDS)[number]['tone'], string> = {
  success: 'bg-emerald-400',
  info: 'bg-sky-300',
  warning: 'bg-amber-300',
};

export function LoginShowcase() {
  return (
    <section className="relative hidden overflow-hidden bg-[#0b1a3a] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* ── Nền: gradient sâu + quầng sáng + lưới mờ ─────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#1d4ed8_0%,_#0b1a3a_55%,_#060f24_100%)]" />
        <div className="qltb-glow absolute -left-32 top-1/4 size-[28rem] rounded-full bg-blue-500/30 blur-[110px]" />
        <div className="qltb-glow absolute -bottom-40 right-0 size-[30rem] rounded-full bg-cyan-400/20 blur-[120px] [animation-delay:2s]" />
        <div className="qltb-grid absolute inset-0 opacity-[0.12]" />

        {/* Thẻ thiết bị nổi — minh hoạ dữ liệu, lệch pha nhau bằng delay. */}
        {FLOATING_CARDS.map((card) => (
          <div
            key={card.code}
            style={{ top: card.top, left: card.left, animationDelay: card.delay }}
            className="qltb-float absolute w-40 rounded-xl border border-white/10 bg-white/[0.06] p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white/85">{card.code}</span>
              <span className={`size-2 rounded-full ${TONE[card.tone]} shadow-[0_0_8px_currentColor]`} />
            </div>
            <div className="mt-1.5 text-sm font-medium text-white">{card.label}</div>
            <div className="mt-0.5 text-xs text-white/55">{card.status}</div>
          </div>
        ))}
      </div>

      {/* ── Nội dung ───────────────────────────────────────────── */}
      <div className="relative flex items-center gap-3">
        <BrandMark className="size-11 drop-shadow-[0_8px_24px_rgba(59,130,246,0.45)]" />
        <div>
          <div className="text-lg font-semibold tracking-tight">{APP_NAME}</div>
          <div className="text-xs text-white/55">Quản lý thiết bị</div>
        </div>
      </div>

      <div className="relative max-w-[26rem] pr-8">
        <h2 className="text-4xl font-semibold leading-tight tracking-tight">
          Biết thiết bị nào
          <br />
          <span className="bg-gradient-to-r from-sky-300 to-blue-100 bg-clip-text text-transparent">
            đang ở đâu, do ai giữ.
          </span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/65">
          Một nơi cho toàn bộ vòng đời thiết bị: nhập kho, cấp phát, bảo trì, thanh lý.
        </p>

        <ul className="mt-8 space-y-4">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06]">
                <Icon className="size-4 text-sky-300" />
              </span>
              <div>
                <div className="text-sm font-medium">{title}</div>
                <div className="text-sm text-white/55">{text}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/40">© {new Date().getFullYear()} {APP_NAME}. Hệ thống nội bộ.</p>
    </section>
  );
}
