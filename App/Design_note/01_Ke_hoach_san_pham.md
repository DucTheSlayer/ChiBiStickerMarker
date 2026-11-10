# 01 – Kế hoạch sản phẩm (rút ra từ app tham chiếu)

Nguồn dữ liệu: `ScrappingData/` (manifest, tên lớp, chuỗi UI, tài nguyên). Phân tích tĩnh – các mục "suy luận" được đánh dấu.

## 1. Tổng quan app tham chiếu
- **Tên:** Chibi Sticker Maker Studio (`com.cutora.stickermaker`), v1.0.2.
- **Giá trị cốt lõi:** biến ảnh thành sticker WhatsApp (tĩnh & động), chỉnh sửa, quản lý bộ sưu tập, xuất sang WhatsApp.
- **Tagline (onboarding):** *Make Unlimited Sticker Packs · Smart Cutout Tools · Fun Text & Decorations · Easy Export & Share*.
- **Ngôn ngữ UI:** 25 locale (en, vi, ar, de, es, fr, hi, id, it, ja, ko, pt, ru, th, tr, zh…), chọn ở màn Language lần đầu.
- **Kiếm tiền:** quảng cáo (AppLovin MAX, AdMob, Unity, Vungle, Pangle, Meta) + mở khoá bằng xem quảng cáo thưởng (bảng `unlock_*`) + Google Play Billing (có thư viện, chưa thấy SKU cụ thể).

## 2. Tính năng (quan sát từ tên lớp / chuỗi / layout)
| Nhóm | Tính năng | Bằng chứng |
|---|---|---|
| Khám phá | Home theo **category**, danh sách pack (phân trang), chi tiết pack, "Related sticker" | `HomeFragment`, `PackListFragment`, `StickerPackCategoryModel`, `StickerPackByCategoryPagingSource`, `StickerPackDetailActivity` |
| Tạo sticker | Chọn ảnh → **Remove BG** (ML Kit selfie segmentation) → chỉnh mask thủ công (cọ/tẩy) | `SegmentationHelper`, `MaskEditorView`, `selfiesegmentation_*.tflite`, `enableRemoveBg` |
| Chỉnh sửa | Layer (ảnh/chữ), undo/redo, gesture, nền (màu/ảnh), khung (frame) | `StickerMakerView`, `LayerManager`, `ActionManager`, `Background*`, `StickerFrameRepositoryImpl` |
| Trang trí | Text (font, màu), brush (stroke/icon: tim, sao, hoa, bướm…), decorate-sticker theo nhóm, color picker | `TextLayer`, `TextFont`, `DrawingView`, `Brush*`, `DecorateStickerGroup`, `AppColorPicker` |
| Bộ sưu tập | Tạo/đổi tên/xoá collection, thêm sticker vào collection, lưu cục bộ | `Collection*`, `AddToCollection*`, Room `saved_sticker_packs` |
| Xuất | **Thêm vào WhatsApp** (và WhatsApp Business), hướng dẫn 3 bước, chia sẻ | `StickerContentProvider`, `WhitelistCheck`, `dialog_how_to_use`, `step_1..3` |
| Mở khoá | Mở khoá brush/sticker/decorate/font bằng reward | Room: `unlock_sticker`, `unlock_decorate_sticker`, `UnlockBrush/TextFont` |
| Hệ thống | Onboarding 4 trang, chọn ngôn ngữ, đánh giá, cập nhật bắt buộc, khảo sát gỡ cài đặt (`KeepUser`, `SurveyUser`), FCM push, Remote Config | `OnBoardingNewActivity`, `dialog_rate`, `dialog_update_app`, `MyFirebaseMessagingService`, `AppRemoteConfig` |

## 3. Kiến trúc kỹ thuật (suy luận từ tên lớp)
- Kotlin, **MVVM** (ViewModel + UiState), **Koin** DI (`di/*Module`), **Room** DB (4 DAO unlock + SavedStickerPack), **DataStore/SharedPrefs**, **Retrofit** + `DownloadService` (tải pack), **Glide**, Lottie cho loading, **Paging** cho danh sách.
- Dữ liệu sticker pack **nằm trên server** (đường dẫn `/sticker_packs`, `/sticker_packs/…`; Firebase project `apptest17-sticker-v5`). Base URL không lộ dạng chuỗi trong DEX → chưa xác định (cần phân tích động nếu muốn).
- Mô hình dữ liệu chính (từ constructor): `StickerPackModel{identifier,name,publisher,thumbnail,stickers,imageDataVersion,animated,isLocal,createDate…}`, `Sticker`, `StickerConfig`, `StickerMask`, `StickerFrame`, `DecorateStickerGroup{id,…}` / `DecorateSticker{url}`, `AddCollection`, `AdsModel`, `OnBoardingModel`, `HowToUse`.
- Chuẩn WhatsApp: `StickerContentProvider` (authority `…stickercontentprovider`) + `EXTRA_STICKER_PACK_ID/AUTHORITY/NAME` – đúng contract của WhatsApp Sticker API.

## 4. Kế hoạch cho dự án "Chibi Sticker Maker" của bạn
**Phase 0 – Nền tảng (1–2 tuần):** project Android/Kotlin, MVVM + Koin/Hilt, Room, màn Splash/Language/Onboarding, theme chibi (tham khảo `images/drawables`, font Comfortaa/Gorditas/Kodchasan).
**Phase 1 – MVP tạo sticker (3–4 tuần):** chọn ảnh → crop → Remove BG (ML Kit) → mask editor → lưu PNG/WebP 512×512 (<100 KB cho tĩnh) → pack cục bộ.
**Phase 2 – Editor đầy đủ (3–4 tuần):** layer system, text + font + màu, brush/stroke/icon, nền, frame, undo/redo.
**Phase 3 – Export WhatsApp (1–2 tuần):** ContentProvider theo contract, whitelist check, hướng dẫn 3 bước, WhatsApp Business.
**Phase 4 – Nội dung & backend (2–3 tuần):** catalog pack theo category (Firebase/Storage hoặc CDN), phân trang, tải về, Remote Config, force-update.
**Phase 5 – Kiếm tiền & tăng trưởng (2 tuần):** native/interstitial/app-open ads, rewarded unlock, billing remove-ads, FCM, rate dialog, survey gỡ app.
**Phase 6 – Hoàn thiện:** 20+ ngôn ngữ, crashlytics, test thiết bị yếu, chuẩn bị Play (Data safety, GDPR UMP).

## 5. Điểm cần cải thiện so với bản gốc (cơ hội)
- Bản gốc nhồi nhiều SDK quảng cáo (6 mạng) → ảnh hưởng tốc độ/APK 53 MB; có thể gọn hơn.
- `allowBackup=true`; nên tắt hoặc giới hạn.
- Chưa thấy tính năng sticker động tự tạo (chỉ nhận pack animated) – có thể là điểm khác biệt.

## 6. Việc chưa làm được / chưa chắc
- Không decompile → chưa biết logic chi tiết, API endpoint, schema JSON server.
- Nội dung sticker pack thật chưa có trong APK (chỉ lấy được qua mạng/ runtime).
- Muốn đi sâu: cung cấp JADX MCP JAR + apktool (REA không tự cài) hoặc cho phép phân tích động.
