# Kiến trúc & phân luồng Frontend / Backend

## 1. Nguyên tắc phân luồng
| Việc | Frontend (device) | Backend (server) |
|---|---|---|
| Tạo sticker (chọn ảnh, tách nền, layer, text, brush, export WebP) | ✅ 100% trên máy, offline | ❌ không nhận ảnh người dùng (riêng tư, rẻ) |
| Lưu pack/collection của người dùng | ✅ Capacitor Preferences + Filesystem | ❌ |
| Mở khoá nội dung bằng reward | ✅ lưu cục bộ (`unlock` store) | gắn cờ `premium` trên item |
| Catalog sticker pack theo category, phân trang | hiển thị, cache | ✅ nguồn dữ liệu (`/api/packs`) |
| Nhóm decoration / font / brush | hiển thị | ✅ `/api/decorations`, `/api/fonts` |
| Remote config (force update, bật/tắt ads, text) | đọc khi Splash | ✅ `/api/config` |
| Xuất WhatsApp | ✅ plugin native Android | ❌ |

→ Backend **chỉ phục vụ nội dung & cấu hình (read-only)**, không có tài khoản, không lưu dữ liệu người dùng.

## 2. Backend (`backend/`)
```
routes/      HTTP: validate query, gọi service, trả JSON (không chứa logic)
services/    nghiệp vụ: phân trang, tìm kiếm, ghép URL asset
data/        dữ liệu tĩnh + bộ sinh SVG chibi gốc (art do dự án tự tạo)
app.ts       createApp() – dùng cho test (supertest)
server.ts    listen
```
Luồng: `request → routes → services → data → JSON`. Asset sticker trả dạng SVG qua `/assets/...` (sinh động, cache-control dài).

## 3. Frontend (`frontend/src`)
```
api/         HTTP client mỏng (fetch) + kiểu DTO → chỉ nói chuyện với backend
services/    logic không UI: storage, whatsapp (plugin), bgRemove, imageExport
editor/      engine canvas thuần TS (layer, history, gesture) – không phụ thuộc Vue
stores/      Pinia: app (config, language), catalog, collection, unlock, editor
views/       màn hình (route level)
components/  UI tái sử dụng
i18n/        đa ngôn ngữ nhẹ (en, vi, ...)
router/      vue-router (lazy-load)
```
Phụ thuộc một chiều: `views → stores → services/api → (network | Capacitor)`; `editor` chỉ được dùng bởi `views/EditorView` và store `editor`.

## 4. Luồng chính
1. **Splash** → `GET /api/config` (timeout 3 s, fallback cấu hình mặc định) → kiểm tra `minVersion`.
2. **Home** → `GET /api/categories`, `GET /api/packs?category=&page=` (infinite scroll).
3. **Create** → ảnh từ `<input type=file>`/Camera → `bgRemove` (flood-fill + feather, chạy cục bộ) → `StickerEditor` → `exportWebp()` 512×512 ≤100 KB.
4. **Save** → `collection` store lưu metadata (Preferences) + file WebP (Filesystem).
5. **Add to WhatsApp** → `services/whatsapp.ts` → plugin `StickerExport` (Android) ghi pack vào thư mục app + `StickerContentProvider` + Intent `ENABLE_STICKER_PACK`. Web: tải file về.

## 5. Mobile (Capacitor)
- `capacitor.config.ts` appId `com.chibistudio.app`.
- Plugin native `StickerExportPlugin` + `StickerContentProvider` nằm trong `frontend/android-src/` và được `scripts/install-android.mjs` chép vào project Android sau `npx cap add android` (giữ git sạch).

## 6. Bảo mật & bản quyền
- Không dùng asset/mã/ID/API của app gốc. Art chibi do bộ sinh SVG riêng tạo; font hệ thống/Google Fonts (OFL) chọn riêng.
- Không có SDK ads trong bản này (chỉ có điểm gắn `AdSlot` để tích hợp sau).
- CORS giới hạn qua biến `CORS_ORIGIN`.
