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
