<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref, watch } from 'vue';
import PackCard from '@/components/PackCard.vue';
import { assetUrl } from '@/api/client';
import { useI18n } from '@/i18n';
import { useCatalogStore } from '@/stores/catalog';

const FEATURED_COUNT = 5;

const { t, lang } = useI18n();
const catalog = useCatalogStore();
const q = ref(catalog.query);
const sentinel = ref<HTMLElement | null>(null);
let debounce: ReturnType<typeof setTimeout> | undefined;

/** Đang duyệt tự do (không lọc, không tìm) thì mới có hàng "Nổi bật". */
const browsing = computed(() => !catalog.category && !catalog.query);
const featured = computed(() =>
  browsing.value && catalog.packs.length > FEATURED_COUNT + 2 ? catalog.packs.slice(0, FEATURED_COUNT) : [],
);
const gridPacks = computed(() => catalog.packs.slice(featured.value.length));
const gridTitle = computed(() => {
  if (catalog.query) return t('results');
  const c = catalog.categories.find((x) => x.id === catalog.category);
  return c ? `${c.emoji} ${c.name[lang.value]}` : t('morePacks');
});
const empty = computed(() => !catalog.loading && !catalog.error && !catalog.packs.length);

/** Hình trang trí trên banner: giữ lại từ lần tải đầu để không nhấp nháy khi đổi bộ lọc. */
const heroArt = ref<string[]>([]);
watch(featured, (f) => { if (f.length >= 2) heroArt.value = f.slice(0, 2).map((p) => p.trayUrl); }, { immediate: true });

onMounted(async () => {
  await catalog.loadCategories();
  if (!catalog.packs.length) await catalog.reset();
  if (sentinel.value) {
    new IntersectionObserver((e) => { if (e[0]?.isIntersecting) catalog.loadMore(); }, { rootMargin: '300px' }).observe(sentinel.value);
  }
});

watch(q, (v) => {
  clearTimeout(debounce);
  debounce = setTimeout(() => catalog.reset({ q: v }), 300);
});
</script>

<template>
  <div class="pb-28">
    <header class="flex items-center gap-3 px-4 pt-5">
      <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-candy-grape text-2xl shadow-card">🐱</span>
      <div class="min-w-0">
        <p class="text-xs text-ink/55">{{ t('greeting') }}</p>
        <h1 class="text-xl font-bold leading-tight">{{ t('appName') }}</h1>
      </div>
    </header>

    <label class="mx-4 mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-card focus-within:ring-2 focus-within:ring-brand-400">
      <Icon icon="solar:magnifer-linear" width="20" class="shrink-0 text-ink/40" />
      <input v-model="q" type="search" :placeholder="t('search')" class="w-full bg-transparent outline-none placeholder:text-ink/40" />
    </label>

    <RouterLink
      v-if="!catalog.query" to="/editor"
      class="relative mx-4 mt-4 block overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-500 via-brand-400 to-candy-grape p-5 text-white shadow-pop transition-transform duration-150 active:scale-[0.98]"
    >
      <span class="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/15" />
      <span class="absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-white/10" />
      <div class="relative max-w-[62%]">
        <p class="text-lg font-bold leading-snug">{{ t('heroTitle') }}</p>
        <p class="mt-1 text-[13px] leading-snug text-white/90">{{ t('heroBody') }}</p>
        <span class="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm">
          <Icon icon="solar:magic-stick-3-bold" width="16" />{{ t('heroCta') }}
        </span>
      </div>
      <template v-if="heroArt.length === 2">
        <img :src="assetUrl(heroArt[1]!)" alt="" class="absolute right-16 top-3 h-16 w-16 -rotate-12 drop-shadow-lg" />
        <img :src="assetUrl(heroArt[0]!)" alt="" class="absolute -bottom-2 -right-2 h-28 w-28 rotate-6 drop-shadow-xl" />
      </template>
    </RouterLink>

    <div class="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-4 py-1">
      <button
        class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
        :class="catalog.category === '' ? 'bg-ink text-white shadow-md' : 'bg-white text-ink/70 shadow-card'"
        @click="catalog.reset({ category: '' })"
      >{{ t('all') }}</button>
      <button
        v-for="c in catalog.categories" :key="c.id"
        class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
        :class="catalog.category === c.id ? 'bg-ink text-white shadow-md' : 'bg-white text-ink/70 shadow-card'"
        @click="catalog.reset({ category: c.id })"
      >{{ c.emoji }} {{ c.name[lang] }}</button>
    </div>

    <section v-if="featured.length" class="mt-4">
      <h2 class="flex items-center gap-1.5 px-4 text-base font-semibold">
        <Icon icon="solar:fire-bold" width="18" class="text-orange-400" />{{ t('featured') }}
      </h2>
      <div class="no-scrollbar mt-2 flex snap-x gap-3 overflow-x-auto px-4 pb-5 pt-1">
        <PackCard v-for="p in featured" :key="p.id" :pack="p" class="w-40 shrink-0 snap-start" />
      </div>
    </section>

    <section class="px-4" :class="featured.length ? '' : 'mt-4'">
      <h2 v-if="catalog.packs.length" class="text-base font-semibold">{{ gridTitle }}</h2>
      <div class="mt-3 grid grid-cols-2 gap-3">
        <PackCard v-for="p in gridPacks" :key="p.id" :pack="p" />
        <template v-if="catalog.loading && !catalog.packs.length">
          <div v-for="i in 4" :key="i" class="animate-pulse rounded-[28px] bg-white p-2.5 shadow-card">
            <div class="aspect-square rounded-[20px] bg-brand-100" />
            <div class="mx-1 mt-3 h-3.5 w-3/4 rounded-full bg-brand-100" />
            <div class="mx-1 mb-1 mt-2 h-3 w-1/2 rounded-full bg-brand-100/70" />
          </div>
        </template>
      </div>

      <div v-if="catalog.error" class="mt-6 rounded-3xl bg-white p-5 text-center text-sm shadow-card">
        <Icon icon="solar:cloud-cross-bold-duotone" width="40" class="mx-auto text-brand-400" />
        <p class="mt-2 text-ink/70">{{ t('offline') }}</p>
        <button class="mt-3 rounded-full bg-brand-500 px-5 py-2 font-semibold text-white active:scale-95" @click="catalog.reset()">{{ t('retry') }}</button>
      </div>
      <div v-else-if="empty" class="mt-10 text-center">
        <Icon icon="solar:ghost-bold-duotone" width="56" class="mx-auto text-brand-400" />
        <p class="mt-2 text-sm text-ink/60">{{ t('noResults') }}</p>
      </div>
      <p v-else-if="catalog.loading && catalog.packs.length" class="mt-6 text-center text-sm text-ink/50">{{ t('loading') }}</p>
      <div ref="sentinel" class="h-8" />
    </section>
  </div>
</template>
