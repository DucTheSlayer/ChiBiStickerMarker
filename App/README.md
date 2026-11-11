# Chibi Sticker Studio

Ứng dụng tạo sticker WhatsApp (clone ý tưởng, **không sao chép tài nguyên/mã** của app gốc).

| Lớp | Công nghệ | Thư mục |
|---|---|---|
| Frontend (UI + editor) | Vue 3 + TypeScript + Pinia + Vue Router + Tailwind CSS 4 + `@iconify/vue` | `frontend/` |
| Mobile shell | Capacitor 7 (Android) + plugin native `StickerExport` | `frontend/android/` |
| Backend (catalog API) | Node + Express + TypeScript (+ Vitest/Supertest) | `backend/` |
| Tài liệu | kiến trúc, hợp đồng API, phân luồng | `docs/` |

## Chạy nhanh
```bash
# Backend (cổng 4000)
cd backend && npm install && npm run dev

# Frontend (cổng 5173) – proxy /api và /assets sang backend
cd frontend && npm install && npm run dev

# Đóng gói Android
cd frontend && npm run build && npx cap sync android && npx cap open android
```
Đọc `docs/ARCHITECTURE.md` để hiểu phân luồng frontend/backend.

## Nguồn catalog: local (mặc định) hoặc remote
UI (`frontend/src`) kết nối với backend qua `frontend/src/api/client.ts`, theo 2 chế độ:

- **local** (mặc định): UI import thẳng tầng service của backend (`backend/src/services`, alias `@backend`)
  và chạy ngay trong app (`frontend/src/api/local.ts`). Không cần server, app chạy được offline,
  không cần `adb reverse`. Chỉ cần `cd frontend && npm run dev`.
- **remote**: gọi server Express như trước. Bật bằng `VITE_CATALOG_SOURCE=remote`
  (dev dùng proxy sang cổng 4000; bản native thì đặt thêm `VITE_API_BASE`).

Cả 2 chế độ dùng chung một mã nguồn backend, nên sửa catalog ở `backend/src/data` là đủ.
