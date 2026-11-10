/** DTO của backend (xem docs/API.md) */
export interface RemoteConfig {
  minVersion: string;
  latestVersion: string;
  adsEnabled: boolean;
  featureFlags: Record<string, boolean>;
  languages: string[];
}

export interface Category { id: string; name: { en: string; vi: string }; emoji: string }

export interface PackSummary {
  id: string;
  name: string;
  publisher: string;
  categoryId: string;
  animated: false;
  stickerCount: number;
  trayUrl: string;
  premium: boolean;
  downloads: number;
}

export interface PackDetail extends PackSummary {
  stickers: { id: string; emoji: string; url: string }[];
  related: PackSummary[];
}

export interface PageResult<T> { items: T[]; page: number; pageSize: number; total: number; hasMore: boolean }

export interface DecorGroup { id: string; name: string; premium: boolean; items: { id: string; url: string }[] }
export interface FontInfo { id: string; family: string; label: string; premium: boolean }

/** Dữ liệu người dùng (lưu cục bộ) */
export interface LocalSticker { id: string; emojis: string[] }

export interface LocalPack {
  id: string;
  name: string;
  publisher: string;
  createdAt: number;
  stickers: LocalSticker[];
}

export type LangCode = 'en' | 'vi';
