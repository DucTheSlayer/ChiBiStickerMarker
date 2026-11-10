# Phát triển & kiểm thử

## Yêu cầu
Node ≥ 22, JDK 21+ (đã thử với JDK 24), Android SDK 36 (để build APK).

## Lệnh
| Việc | Lệnh |
|---|---|
| Backend dev / test / build | `cd backend && npm run dev` / `npm test` / `npm run build` |
| Frontend dev | `cd frontend && npm run dev` (proxy `/api`, `/assets` → `localhost:4000`) |
| Frontend test / typecheck / build | `npm test` / `npm run typecheck` / `npm run build` |
| Android debug APK | `npm run build && npx cap sync android && cd android && ./gradlew assembleDebug` (đặt `JAVA_HOME` = JDK 21+, `local.properties` có `sdk.dir`) |

APK ra tại `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.

## Cấu hình khi chạy trên điện thoại
Frontend trong WebView không có proxy → build với địa chỉ API thật:
`VITE_API_BASE=https://api.example.com npm run build`. Backend: đặt `CORS_ORIGIN=https://localhost,capacitor://localhost` nếu cần giới hạn.

## Trạng thái đã kiểm chứng
- Backend: 8 test (supertest) pass, typecheck pass.
- Frontend: 6 test (tách nền, so sánh version) pass, `vue-tsc` + `vite build` pass.
- Android: `assembleDebug` build thành công (có plugin `StickerExport` + `StickerContentProvider`).
- Trình duyệt: Home/Pack detail/lưu vào Collection chạy; engine editor kiểm tra bằng script (tách nền, undo/redo, text, nền, xuất WebP 512×512).

## Chưa kiểm chứng / hạn chế
- **Chưa chạy trên thiết bị/emulator**: luồng "Add to WhatsApp" (Intent + ContentProvider) mới được biên dịch, chưa thử với WhatsApp thật.
- Icon dùng `@iconify/vue` tải từ API Iconify khi chạy → cần mạng lần đầu. Muốn offline hoàn toàn: `addCollection()` với bộ icon gói sẵn (`@iconify-json/solar`).
- Font (Fredoka, Pacifico…) tải từ Google Fonts (cần mạng); nên bundle bằng `@fontsource/*` khi phát hành.
- Quảng cáo/billing chưa tích hợp: `UnlockDialog` là điểm gắn rewarded ad (đang mô phỏng đếm ngược 3 giây).
- Tách nền là thuật toán flood-fill theo màu viền (nền đơn sắc); chưa có segmentation ML như app gốc.
- Chưa có sticker động.
