# 02 – Luồng hoạt động (user flow & data flow)

Suy luận từ manifest, tên Activity/Fragment/ViewModel, layout, chuỗi UI. Mức tin cậy: **trung bình** (chưa đọc mã decompile).

## 1. Khởi động lần đầu
```mermaid
flowchart TD
  A[SplashActivity<br/>splash_candy.mp4 + load Remote Config] --> B{Có bản cập nhật bắt buộc?}
  B -- Có --> U[dialog_update_app]
  B -- Không --> C{Lần đầu?}
  C -- Có --> L[LanguageActivity<br/>chọn 1 trong 14 cờ ngôn ngữ] --> O[OnBoardingNewActivity<br/>4 trang]
  O --> N[Xin quyền thông báo<br/>dialog_notification_permission]
  C -- Không --> M
  N --> M[MainActivity]
```
Onboarding: 1) Make Unlimited Sticker Packs → 2) Smart Cutout Tools → 3) Fun Text & Decorations → 4) Easy Export & Share. Có native ad xen kẽ (`native_intro*`, `native_language*`).

## 2. Màn chính (MainActivity – bottom nav)
```mermaid
flowchart LR
  M[MainActivity] --> H[HomeFragment<br/>tabs theo category]
  M --> CB[Nút Create giữa<br/>create_bottom_bar_main]
  M --> CO[CollectionFragment]
  M --> S[SettingActivity<br/>Language · Privacy · Rate · Share]
  H --> PL[PackListFragment<br/>Paging từ server] --> D[StickerPackDetailActivity]
  D --> W[Add to WhatsApp]
  D --> R[Related stickers]
  CO --> CD[CollectionDetailActivity]
```

## 3. Luồng tạo sticker (core)
```mermaid
flowchart TD
  C[Nhấn Create] --> F{Lần đầu?}
  F -- Có --> FTU[CreateFTUActivity<br/>'Make awesome sticker like these']
  F -- Không --> P
  FTU --> P[Chọn ảnh từ máy<br/>PhotoEditActivity]
  P --> SEG[SegmentationHelper<br/>ML Kit selfie segmentation → Remove BG]
  SEG --> MASK[MaskEditorView<br/>cọ/tẩy tinh chỉnh]
  MASK --> CS[CreateStickerActivity<br/>layers + background + text + decorate + brush]
  CS --> SV[CreateSaveActivity<br/>đặt tên, chọn collection, Save]
  SV --> ST[(Room: saved_sticker_packs<br/>+ file qua FileManager)]
  SV --> OK[SuccessEditActivity<br/>Related stickers + Add to WhatsApp]
```
Công cụ trong editor: Layers (xem/ẩn/sắp xếp) · Background (màu/ảnh) · Text (font Kodchasan/Comfortaa/Gorditas, màu) · Brush (stroke 1–8, icon tim/sao/hoa/bướm) · Decorate sticker (nhóm tải từ server, có khoá reward) · Undo/Redo · Discard dialog.

## 4. Chỉnh sửa sticker có sẵn
`CollectionDetailActivity` → chọn sticker → `EditStickerActivity` (cùng bộ công cụ với Create) → Save → cập nhật Room.

## 5. Thêm vào WhatsApp
```mermaid
sequenceDiagram
  participant U as User
  participant A as App
  participant CP as StickerContentProvider
  participant WA as WhatsApp / WA Business
  U->>A: Add to WhatsApp
  A->>A: Kiểm tra WhatsApp đã cài? (dialog_whatsapp_not_installed)
  A->>CP: Chuẩn bị pack (identifier, name, publisher, tray, stickers)
  A->>WA: Intent ADD_STICKER_PACK (EXTRA_STICKER_PACK_ID/AUTHORITY/NAME)
  WA->>CP: query metadata / sticker files
  CP-->>WA: danh sách sticker (WhitelistCheck)
  WA-->>U: xác nhận 'Add to WhatsApp?'
  A-->>U: dialog_add_sticker_pack_success + hướng dẫn 3 bước
```
Hướng dẫn: ① mở WhatsApp, bấm icon sticker ② chọn pack đã xuất ③ chạm sticker để gửi.

## 6. Luồng dữ liệu & mở khoá
```mermaid
flowchart LR
  RC[Firebase Remote Config<br/>AppRemoteConfig / CommonRemoteConfig] -->|ads on/off, version| APP
  SRV[(Server: /sticker_packs, decorate, brush, font, frame)] -->|Retrofit + DownloadService| REPO[Repositories]
  REPO --> VM[ViewModels] --> UI
  UI -->|xem reward ad| UNL[(Room unlock_*)]
  UNL --> REPO
  APP -->|FCM| PUSH[MyFirebaseMessagingService]
```

## 7. Luồng thoát / giữ chân
Back khi đang tạo → `are_you_sure_to_exit_the_app`/`dialog_discard_changes`. Gỡ app → `KeepUserActivity` ("Join Millions of Users…") → `SurveyUserActivity` (chọn lý do).

## 8. Điểm chưa xác định
- Cấu trúc JSON/endpoint server (base URL không thấy trong DEX; có thể từ Remote Config hoặc chuỗi mã hoá — có `assets/aes_*.dat`, có thể thuộc SDK).
- Thứ tự chính xác các màn bên trong `CreateStickerActivity` và quy tắc khoá reward.
Cần decompile (JADX) hoặc phân tích động để xác nhận.
