# ScrappingData – dữ liệu trích từ Chibi Sticker Maker Studio v1.0.2 (com.cutora.stickermaker)

Nguồn: `apk/Chibi-Sticker-Maker-Studio_1.0.2_apkcube.apks` (đã kiểm tra chữ ký, xem Design_note/00).
Phân tích tĩnh, không chạy app. Không có decompiler nên không có mã Java/Kotlin.

| Thư mục | Nội dung |
|---|---|
| `manifest/` | AndroidManifest dạng cây (aapt2 xmltree): activity, provider, quyền |
| `dex_analysis/app_classes.json` | 932 tên lớp `com.cutora.*` (kiến trúc app) |
| `dex_analysis/app_strings_en.json` | chuỗi UI tiếng Anh của app (đã lọc bớt SDK); `all_strings_en.json` = đầy đủ |
| `dex_analysis/urls_in_dex.json` | 137 URL trong DEX (hầu hết SDK quảng cáo) |
| `dex_analysis/keyword_strings.json` | chuỗi DEX khớp từ khoá (nhiều nhiễu SDK) |
| `dex_analysis/resource_*.json`, `dex_analysis/dex_summary.json` | thống kê & tên layout/raw/font/xml |
| `images/drawables`, `images/mipmaps`, `images/flags` | ảnh UI (webp/png/gif), icon launcher, cờ 14 ngôn ngữ |
| `json/lottie_loading/` | Lottie loading + `splash_candy.mp4` |
| `json/template/metadata.json` | metadata template quảng cáo (SDK, không phải của app) |
| `fonts/` | font Comfortaa, Gorditas, Kodchasan (dùng cho Text editor) |
| `ml_models/` | model segmentation selfie (tflite + binarypb) dùng cho Remove BG |

Không có trong APK: các sticker pack (tải từ server lúc chạy), thumbnail pack.
