import type { Category, DecorGroup, FontInfo, PackDetail, PackSummary, PageResult, RemoteConfig } from '@/types';
import { getJson } from './client';

export const catalogApi = {
  config: () => getJson<RemoteConfig>('/api/config', { timeoutMs: 3000 }),
  categories: () => getJson<Category[]>('/api/categories'),
  packs: (p: { category?: string; q?: string; page?: number; pageSize?: number }) => {
    const qs = new URLSearchParams();
    if (p.category) qs.set('category', p.category);
    if (p.q) qs.set('q', p.q);
    qs.set('page', String(p.page ?? 1));
    qs.set('pageSize', String(p.pageSize ?? 12));
    return getJson<PageResult<PackSummary>>(`/api/packs?${qs}`);
  },
  pack: (id: string) => getJson<PackDetail>(`/api/packs/${encodeURIComponent(id)}`),
  decorations: () => getJson<DecorGroup[]>('/api/decorations'),
  fonts: () => getJson<FontInfo[]>('/api/fonts'),
};
