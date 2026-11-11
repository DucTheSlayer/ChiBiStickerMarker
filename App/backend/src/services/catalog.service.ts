import { stickerSvg, EMOTIONS, DECOR_GROUPS } from '../data/art.js';
import { ALL_PACKS, CATEGORIES, FONTS, REMOTE_CONFIG, type CatalogPack } from '../data/catalog.js';
import { fluentSvg } from '../data/fluent.js';

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

function stickersOf(p: CatalogPack): { id: string; emoji: string }[] {
  if (p.kind === 'fluent') return p.stickers;
  return p.emotions.map((e) => ({ id: e, emoji: emojiOf.get(e) ?? '🙂' }));
}

export function toSummary(p: CatalogPack): PackSummary {
  return {
    id: p.id,
    name: p.name,
    publisher: p.publisher,
    categoryId: p.categoryId,
    animated: false,
    stickerCount: stickersOf(p).length,
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
  const filtered = ALL_PACKS.filter((p) => {
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

/** 2 = cùng danh mục, 1 = cùng loài chibi hoặc cùng nguồn Fluent, 0 = không liên quan. */
function relatedScore(a: CatalogPack, b: CatalogPack): number {
  if (a.categoryId === b.categoryId) return 2;
  if (a.kind === 'chibi' && b.kind === 'chibi') return a.species === b.species ? 1 : 0;
  return a.kind === b.kind ? 1 : 0;
}

export function getPack(id: string): PackDetail | undefined {
  const pack = ALL_PACKS.find((p) => p.id === id);
  if (!pack) return undefined;
  const related = ALL_PACKS.filter((p) => p.id !== id && relatedScore(p, pack) > 0)
    .sort((a, b) => relatedScore(b, pack) - relatedScore(a, pack))
    .slice(0, 6)
    .map(toSummary);
  return {
    ...toSummary(pack),
    stickers: stickersOf(pack).map((s) => ({ ...s, url: `/assets/packs/${pack.id}/${s.id}.svg` })),
    related,
  };
}

export function renderSticker(packId: string, stickerId: string): string | undefined {
  const pack = ALL_PACKS.find((p) => p.id === packId);
  if (!pack) return undefined;
  if (pack.kind === 'fluent') {
    const id = stickerId === 'tray' ? pack.stickers[0]?.id : pack.stickers.find((s) => s.id === stickerId)?.id;
    return id ? fluentSvg(id) : undefined;
  }
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
