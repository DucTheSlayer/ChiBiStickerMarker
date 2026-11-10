<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted, ref, watch } from 'vue';
import PackCard from '@/components/PackCard.vue';
import { useI18n } from '@/i18n';
import { useCatalogStore } from '@/stores/catalog';

const { t, lang } = useI18n();
const catalog = useCatalogStore();
const q = ref(catalog.query);
const sentinel = ref<HTMLElement | null>(null);
let debounce: ReturnType<typeof setTimeout> | undefined;

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
  <div class="p-4 pb-24">
    <h1 class="text-2xl font-bold">🐱 {{ t('appName') }}</h1>
    <label class="mt-3 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-brand-100">
      <Icon icon="solar:magnifer-linear" width="20" class="text-ink/40" />
      <input v-model="q" type="search" :placeholder="t('search')" class="w-full bg-transparent outline-none" />
    </label>

    <div class="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
      <button
        class="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold"
        :class="catalog.category === '' ? 'bg-brand-500 text-white' : 'bg-white text-ink/70'"
        @click="catalog.reset({ category: '' })"
      >{{ t('all') }}</button>
      <button
        v-for="c in catalog.categories" :key="c.id"
        class="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold"
        :class="catalog.category === c.id ? 'bg-brand-500 text-white' : 'bg-white text-ink/70'"
        @click="catalog.reset({ category: c.id })"
      >{{ c.emoji }} {{ c.name[lang] }}</button>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3">
      <PackCard v-for="p in catalog.packs" :key="p.id" :pack="p" />
    </div>

    <p v-if="catalog.error" class="mt-6 rounded-2xl bg-white p-4 text-center text-sm">
      {{ t('offline') }}
      <button class="mt-2 block w-full font-semibold text-brand-600" @click="catalog.reset()">{{ t('retry') }}</button>
    </p>
    <p v-else-if="catalog.loading" class="mt-6 text-center text-sm text-ink/50">{{ t('loading') }}</p>
    <div ref="sentinel" class="h-8" />
  </div>
</template>
