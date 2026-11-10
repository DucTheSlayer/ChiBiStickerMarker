<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { LANGUAGES, setLang, useI18n } from '@/i18n';
import { APP_VERSION, useAppStore } from '@/stores/app';
import type { LangCode } from '@/types';

const { t } = useI18n();
const app = useAppStore();

async function change(code: LangCode) { await app.chooseLanguage(code); setLang(code); }
</script>

<template>
  <div class="p-4 pb-24">
    <h1 class="text-2xl font-bold">{{ t('settings') }}</h1>

    <section class="mt-4 rounded-3xl bg-white p-4 shadow-sm">
      <h2 class="flex items-center gap-2 font-semibold"><Icon icon="solar:global-bold-duotone" width="22" />{{ t('language') }}</h2>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button
          v-for="l in LANGUAGES" :key="l.code"
          class="rounded-2xl py-2 text-sm font-semibold ring-2" :class="app.language === l.code ? 'bg-brand-50 ring-brand-500' : 'ring-transparent bg-brand-50/50'"
          @click="change(l.code)"
        >{{ l.flag }} {{ l.label }}</button>
      </div>
    </section>

    <section class="mt-3 rounded-3xl bg-white p-4 shadow-sm">
      <h2 class="flex items-center gap-2 font-semibold"><Icon icon="solar:info-circle-bold-duotone" width="22" />{{ t('about') }}</h2>
      <p class="mt-2 text-sm text-ink/60">{{ t('version') }} {{ APP_VERSION }}</p>
      <p class="mt-1 text-xs text-ink/40">Chibi Studio – original artwork & code.</p>
    </section>
  </div>
</template>
