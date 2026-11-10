<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@/i18n';
import { useAppStore } from '@/stores/app';
import { useCollectionStore } from '@/stores/collection';
import { useUnlockStore } from '@/stores/unlock';

const router = useRouter();
const route = useRoute();
const app = useAppStore();
const { t } = useI18n();

onMounted(async () => {
  const minDelay = new Promise((r) => setTimeout(r, 900));
  await Promise.all([app.init(), useCollectionStore().load(), useUnlockStore().load(), minDelay]);
  if (app.needsUpdate) return; // hiển thị yêu cầu cập nhật, không điều hướng
  const redirect = typeof route.query.redirect === 'string' && route.query.redirect !== '/' ? route.query.redirect : null;
  const first = !app.languageChosen ? '/language' : !app.onboarded ? '/onboarding' : null;
  await router.replace(first ?? redirect ?? '/home');
});
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center bg-gradient-to-b from-brand-200 to-brand-50 px-8 text-center">
    <div class="animate-bounce text-8xl">🐱</div>
    <h1 class="mt-4 text-3xl font-bold">{{ t('appName') }}</h1>
    <p v-if="app.needsUpdate" class="mt-6 rounded-2xl bg-white p-4 shadow">{{ t('updateRequired') }}</p>
    <p v-else class="mt-6 text-sm text-ink/50">{{ t('loading') }}</p>
  </div>
</template>
