/** Mọi timestamp của API là UTC; hiển thị theo giờ Việt Nam. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
}

/** Ngày dạng YYYY-MM-DD (không có giờ) → dd/mm/yyyy. */
export function formatDate(ymd: string | null): string {
  if (!ymd) return '—';
  const [y, m, d] = ymd.split('-');
  return d && m && y ? `${d}/${m}/${y}` : ymd;
}

export function formatMoney(vnd: number | null): string {
  if (vnd === null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(vnd);
}
