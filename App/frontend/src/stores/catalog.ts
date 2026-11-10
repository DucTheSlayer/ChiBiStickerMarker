import { defineStore } from 'pinia';
import { ref } from 'vue';
import { catalogApi } from '@/api/catalog.api';
import type { Category, DecorGroup, FontInfo, PackSummary } from '@/types';

export const useCatalogStore = defineStore('catalog', () => {
  const categories = ref<Category[]>([]);
  const packs = ref<PackSummary[]>([]);
  const page = ref(0);
  const hasMore = ref(true);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const category = ref<string>('');
  const query = ref('');
  const decorations = ref<DecorGroup[]>([]);
  const fonts = ref<FontInfo[]>([]);
  let token = 0; // bỏ qua kết quả của request cũ khi đổi bộ lọc

  async function loadCategories() {
    if (categories.value.length) return;
    try { categories.value = await catalogApi.categories(); } catch (e) { error.value = (e as Error).message; }
  }

  async function reset(next?: { category?: string; q?: string }) {
    if (next?.category !== undefined) category.value = next.category;
    if (next?.q !== undefined) query.value = next.q;
    packs.value = [];
    page.value = 0;
    hasMore.value = true;
    token++;
    loading.value = false;
    await loadMore();
  }

  async function loadMore() {
    if (loading.value || !hasMore.value) return;
    const mine = token;
    loading.value = true;
    error.value = null;
    try {
      const res = await catalogApi.packs({ category: category.value || undefined, q: query.value || undefined, page: page.value + 1 });
      if (mine !== token) return;
      packs.value.push(...res.items);
      page.value = res.page;
      hasMore.value = res.hasMore;
    } catch (e) {
      if (mine === token) error.value = (e as Error).message;
    } finally {
      if (mine === token) loading.value = false;
    }
  }

  async function loadEditorAssets() {
    const [d, f] = await Promise.allSettled([
      decorations.value.length ? Promise.resolve(decorations.value) : catalogApi.decorations(),
      fonts.value.length ? Promise.resolve(fonts.value) : catalogApi.fonts(),
    ]);
    if (d.status === 'fulfilled') decorations.value = d.value;
    if (f.status === 'fulfilled') fonts.value = f.value;
  }

  return { categories, packs, hasMore, loading, error, category, query, decorations, fonts, loadCategories, reset, loadMore, loadEditorAssets };
});
