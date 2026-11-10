# Hợp đồng API (v1) – base `/api`

Tất cả trả `application/json`. Lỗi: `{ "error": { "code": string, "message": string } }`.

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/health` | `{ ok: true, version }` |
| GET | `/api/config` | Remote config: `minVersion`, `latestVersion`, `adsEnabled`, `featureFlags`, `languages[]` |
| GET | `/api/categories` | `[{ id, name:{en,vi}, emoji }]` |
| GET | `/api/packs?category=&q=&page=1&pageSize=12` | `{ items: PackSummary[], page, pageSize, total, hasMore }` |
| GET | `/api/packs/:id` | `PackDetail` (có `stickers[]`, `related[]`) |
| GET | `/api/decorations` | `[{ id, name, premium, items:[{ id, url }] }]` |
| GET | `/api/fonts` | `[{ id, family, label, premium }]` |
| GET | `/assets/packs/:packId/tray.svg` | ảnh đại diện pack |
| GET | `/assets/packs/:packId/:stickerId.svg` | ảnh sticker (512×512 viewBox) |
| GET | `/assets/decor/:id.svg` | ảnh decoration |

## Kiểu
```ts
PackSummary { id, name, publisher, categoryId, animated:false, stickerCount, trayUrl, premium, downloads }
PackDetail  extends PackSummary { stickers: { id, emoji, url }[], related: PackSummary[] }
```
Phân trang: `page` ≥ 1, `pageSize` 1–50 (mặc định 12). Sai tham số → `400 BAD_QUERY`. Không có pack → `404 PACK_NOT_FOUND`.
