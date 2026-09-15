# qltb-web

Web quản trị của hệ thống quản lý thiết bị QLTB. Next.js 16 · shadcn/ui · Tailwind v4 · TanStack Query.

Tài liệu dự án, quy ước và hợp đồng API nằm ở **`qltb-workspace/docs/`** — đọc `docs/rules/frontend-structure.md` trước khi sửa code.

## Chạy local

```bash
cp .env.example .env.local
npm install
npm run dev               # http://localhost:3401 — cần qltb-service chạy ở :3400
```

## Lệnh

| | |
|---|---|
| `npm run dev` | Dev server |
| `npm run lint` | eslint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | vitest |
| `npx shadcn@latest add <tên>` | Thêm component shadcn vào `components/ui/` |

## Deploy Vercel

Import repo GitHub `qltb-web` thành project riêng (không chung với service).

Khai **trước lần build production**:

```
NEXT_PUBLIC_API_BASE_URL=https://<qltb-service>.vercel.app/api/v1
```

`NEXT_PUBLIC_*` bị nhúng lúc build. Đổi URL API xong phải Redeploy web.
