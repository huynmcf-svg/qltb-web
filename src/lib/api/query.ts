/** Ép object query bất kỳ về dạng `apiFetch` nhận (bỏ undefined giữ nguyên, boolean → chuỗi). */
export function q(obj: object): Record<string, string | number | undefined | null> {
  const out: Record<string, string | number | undefined | null> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = typeof v === 'boolean' ? String(v) : (v as string | number | undefined | null);
  return out;
}
