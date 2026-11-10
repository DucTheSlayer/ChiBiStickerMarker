# 00 – Đánh giá uy tín & an toàn của file APK

**File:** `apk/Chibi-Sticker-Maker-Studio_1.0.2_apkcube.apks` (38,97 MB)
**SHA-256 (.apks):** `4442934324CD26A06615F9748167D7635885934077C5602BD3E328AADE5EB0E0`
**SHA-256 (base.apk):** `bee2c67f0eb6bbb7157f5f2bdd3f7976ec3e9ad6536d6e872526a29545689d1a`
**Package:** `com.cutora.stickermaker` · v1.0.2 (code 102) · minSdk 24 · targetSdk 36
**Kiểu phân tích:** tĩnh (static) – không cài, không chạy app.

## Kết luận
**Mức rủi ro: THẤP – không thấy dấu hiệu độc hại hay bị sửa đổi.** Có thể dùng để phân tích; nếu cài lên máy thật, nên cài vào máy test/emulator trước vì app chứa nhiều SDK quảng cáo.

## Bằng chứng (đã quan sát)
| # | Kiểm tra | Kết quả |
|---|----------|---------|
| 1 | Cấu trúc `.apks` | ZIP bundle chuẩn: `base.apk` + 33 split (ABI arm64, 12 mật độ màn hình, ~25 ngôn ngữ) + `APKCube.txt` ("Source: https://apkcube.com"). Không có file thừa/lạ. |
| 2 | Chữ ký `base.apk` | `apksigner verify` → **Verifies** (v2 + v3 hợp lệ, có SourceStamp). 1 signer, RSA 4096. |
| 3 | Chủ chứng chỉ | `CN=Android, OU=Android, O=Google Inc.` – đây là DN mặc định của khoá **Play App Signing** (không phải debug key). Cert SHA-256 `94ccbf19…e7ec`. |
| 4 | Đồng nhất chữ ký | Các split kiểm tra (`arm64_v8a`, `xxhdpi`, `en`) đều cùng cert với base → bundle không bị ghép từ nguồn khác. |
| 5 | Nguồn gốc Play | Application class là `com.pairip.application.Application` (lớp bảo vệ/kiểm tra licence của Google Play – PairIP), manifest có `com.android.vending.CHECK_LICENSE`. |
| 6 | Quyền (permissions) | Toàn quyền thông dụng: INTERNET, ACCESS_NETWORK_STATE/WIFI_STATE, POST_NOTIFICATIONS, WAKE_LOCK, VIBRATE, FOREGROUND_SERVICE, AD_ID/ADSERVICES_*, BILLING, c2dm (FCM), WRITE_EXTERNAL_STORAGE (chỉ ≤ API 28). **Không** có SMS, danh bạ, camera, mic, vị trí, accessibility, install-packages, device-admin. |
| 7 | URL trong DEX (137) | Toàn bộ là hạ tầng quảng cáo / analytics / Firebase / Google Play (AppLovin, AdMob, Unity Ads, Vungle, Pangle, Facebook, Adjust, Crashlytics…) + `chibify-stickermaker.netlify.app/privacy-policy`. Không có IP trần, không có máy chủ lạ. |

## Lưu ý / rủi ro còn lại (trung thực)
- File được **đóng gói lại bởi bên thứ ba (APKCube)** – chữ ký Google vẫn hợp lệ nên nội dung chưa bị sửa sau khi Google ký; tuy nhiên tôi không thể xác nhận bản này đúng là bản đang phát hành trên Play, chỉ suy luận từ chữ ký + PairIP.
- App có **nhiều SDK quảng cáo** (AppLovin MAX, AdMob, Unity, Vungle, Pangle, Meta Audience Network, Adjust) → nhiều tracking/ads, không phải malware. Có thêm `allowBackup=true`.
- Chưa quét VirusTotal (sẽ phải upload file ra dịch vụ ngoài – cần bạn cho phép). Chưa phân tích động (chưa chạy app).
- Không có JADX/apktool nên chưa đọc được mã nguồn đã decompile; kết luận an toàn dựa trên chữ ký, manifest, quyền, danh sách lớp và chuỗi trong DEX.

## Giới hạn công cụ REA
REA đã mở và kiểm kê `base.apk` (1.823 entry, đủ 100%, không mâu thuẫn toàn vẹn). Các tool Android sâu của REA (`inspect_android_package`, `decode_android_resources`) cần JADX MCP JAR / apktool do người dùng tự cung cấp – máy chưa có nên bị chặn. Phần còn lại dùng `aapt2`, `apksigner` (Android SDK build-tools 36) và script parse DEX/resources.
