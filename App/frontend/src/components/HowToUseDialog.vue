<script setup lang="ts">
import { useI18n } from '@/i18n';

const emit = defineEmits<{ close: [] }>();
const { t } = useI18n();
const steps = ['step1', 'step2', 'step3'] as const;
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40" @click.self="emit('close')">
    <div class="w-full max-w-md rounded-t-3xl bg-white p-6">
      <h2 class="text-lg font-semibold">{{ t('stepsTitle') }}</h2>
      <ol class="mt-4 space-y-3">
        <li v-for="(s, i) in steps" :key="s" class="flex items-center gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 font-bold text-white">{{ i + 1 }}</span>
          <span>{{ t(s) }}</span>
        </li>
      </ol>
      <button class="mt-6 w-full rounded-full bg-brand-500 py-3 font-semibold text-white" @click="emit('close')">{{ t('done') }}</button>
    </div>
  </div>
</template>
