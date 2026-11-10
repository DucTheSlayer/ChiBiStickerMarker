import { stickerSvg, EMOTIONS, DECOR_GROUPS } from '../data/art.js';
import { CATEGORIES, FONTS, PACKS, REMOTE_CONFIG, type PackDef } from '../data/catalog.js';

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

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

const emojiOf = new Map(EMOTIONS.map((e) => [e.id, e.emoji]));

export function toSummary(p: PackDef): PackSummary {
  return {
    id: p.id,
    name: p.name,
    publisher: p.publisher,
    categoryId: p.categoryId,
    animated: false,
    stickerCount: p.emotions.length,
    trayUrl: `/assets/packs/${p.id}/tray.svg`,
    premium: p.premium,
    downloads: p.downloads,
  };
}

export function getConfig() {
  return REMOTE_CONFIG;
}

export function getCategories() {
  return CATEGORIES;
}

export function getFonts() {
  return FONTS;
}

export function getDecorations() {
  return DECOR_GROUPS.map((g) => ({
    id: g.id,
    name: g.name,
    premium: g.premium,
    items: g.items.map((i) => ({ id: i.id, url: `/assets/decor/${i.id}.svg` })),
  }));
}

export interface ListQuery { category?: string; q?: string; page: number; pageSize: number }

export function listPacks(query: ListQuery): PageResult<PackSummary> {
  const q = query.q?.trim().toLowerCase();
  const filtered = PACKS.filter((p) => {
    if (query.category && p.categoryId !== query.category) return false;
    if (q && !p.name.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a, b) => b.downloads - a.downloads);
  const start = (query.page - 1) * query.pageSize;
  const items = filtered.slice(start, start + query.pageSize).map(toSummary);
  return {
    items,
    page: query.page,
    pageSize: query.pageSize,
    total: filtered.length,
    hasMore: start + items.length < filtered.length,
  };
}

export function getPack(id: string): PackDetail | undefined {
  const pack = PACKS.find((p) => p.id === id);
  if (!pack) return undefined;
  const related = PACKS.filter((p) => p.id !== id && (p.categoryId === pack.categoryId || p.species === pack.species))
    .slice(0, 6)
    .map(toSummary);
  return {
    ...toSummary(pack),
    stickers: pack.emotions.map((e) => ({
      id: e,
      emoji: emojiOf.get(e) ?? '🙂',
      url: `/assets/packs/${pack.id}/${e}.svg`,
    })),
    related,
  };
}

export function renderSticker(packId: string, stickerId: string): string | undefined {
  const pack = PACKS.find((p) => p.id === packId);
  if (!pack) return undefined;
  if (stickerId === 'tray') return stickerSvg(pack.species, 'happy', pack.palette);
  const emotion = pack.emotions.find((e) => e === stickerId);
  if (!emotion) return undefined;
  return stickerSvg(pack.species, emotion, pack.palette);
}

export function renderDecor(id: string): string | undefined {
  for (const g of DECOR_GROUPS) {
    const item = g.items.find((i) => i.id === id);
    if (item) return item.svg;
  }
  return undefined;
}
