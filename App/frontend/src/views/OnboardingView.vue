<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@/i18n';
import { useAppStore } from '@/stores/app';

const router = useRouter();
const app = useAppStore();
const { t } = useI18n();

const pages = [
  { emoji: '📦', t: 'onb1t', d: 'onb1d' },
  { emoji: '✂️', t: 'onb2t', d: 'onb2d' },
  { emoji: '✨', t: 'onb3t', d: 'onb3d' },
  { emoji: '💬', t: 'onb4t', d: 'onb4d' },
] as const;
const index = ref(0);
const page = computed(() => pages[index.value]!);
const last = computed(() => index.value === pages.length - 1);

async function next() {
  if (!last.value) { index.value++; return; }
  await app.finishOnboarding();
  await router.replace('/home');
}
</script>

<template>
  <div class="flex h-full flex-col items-center p-6 text-center">
    <div class="mt-16 flex h-56 w-56 items-center justify-center rounded-[3rem] bg-gradient-to-br from-brand-200 to-white text-8xl shadow-inner">{{ page.emoji }}</div>
    <h1 class="mt-10 text-2xl font-bold">{{ t(page.t) }}</h1>
    <p class="mt-2 max-w-xs text-ink/60">{{ t(page.d) }}</p>
    <div class="mt-6 flex gap-2" aria-hidden="true">
      <span v-for="(_, i) in pages" :key="i" class="h-2 rounded-full transition-all" :class="i === index ? 'w-6 bg-brand-500' : 'w-2 bg-brand-200'" />
    </div>
    <button class="mt-auto w-full rounded-full bg-brand-500 py-3 font-semibold text-white active:scale-95" @click="next">{{ last ? t('start') : t('next') }}</button>
  </div>
</template>
