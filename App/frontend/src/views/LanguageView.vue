<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { LANGUAGES, setLang, useI18n } from '@/i18n';
import { useAppStore } from '@/stores/app';
import type { LangCode } from '@/types';

const router = useRouter();
const app = useAppStore();
const { t } = useI18n();
const selected = ref<LangCode>(app.language);

function pick(code: LangCode) { selected.value = code; setLang(code); }
async function confirm() {
  await app.chooseLanguage(selected.value);
  await router.replace(app.onboarded ? '/home' : '/onboarding');
}
</script>

<template>
  <div class="flex h-full flex-col p-6">
    <h1 class="mt-10 text-2xl font-bold">{{ t('chooseLanguage') }}</h1>
    <ul class="mt-6 space-y-3">
      <li v-for="l in LANGUAGES" :key="l.code">
        <button
          class="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-2 transition"
          :class="selected === l.code ? 'ring-brand-500' : 'ring-transparent'"
          @click="pick(l.code)"
        >
          <span class="text-3xl">{{ l.flag }}</span>
          <span class="flex-1 font-semibold">{{ l.label }}</span>
          <Icon v-if="selected === l.code" icon="solar:check-circle-bold" width="26" class="text-brand-500" />
        </button>
      </li>
    </ul>
    <button class="mt-auto rounded-full bg-brand-500 py-3 font-semibold text-white active:scale-95" @click="confirm">{{ t('continue') }}</button>
  </div>
</template>
