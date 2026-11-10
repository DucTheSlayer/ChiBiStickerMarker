<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onBeforeUnmount, ref } from 'vue';
import { useI18n } from '@/i18n';

/**
 * Điểm gắn cho rewarded ad. Bản này mô phỏng bằng đếm ngược 3 giây;
 * thay `watch()` bằng lời gọi SDK quảng cáo thật khi tích hợp.
 */
const emit = defineEmits<{ close: []; unlocked: [] }>();
const { t } = useI18n();
const watching = ref(false);
const left = ref(3);
let timer: ReturnType<typeof setInterval> | undefined;

function watch() {
  watching.value = true;
  timer = setInterval(() => {
    left.value -= 1;
    if (left.value <= 0) {
      clearInterval(timer);
      emit('unlocked');
    }
  }, 1000);
}
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" @click.self="emit('close')">
    <div class="w-full max-w-md rounded-t-3xl bg-white p-6 text-center sm:rounded-3xl">
      <Icon icon="solar:crown-bold-duotone" width="56" class="mx-auto text-amber-400" />
      <h2 class="mt-2 text-xl font-semibold">{{ t('unlockTitle') }}</h2>
      <p class="mt-1 text-sm text-ink/60">{{ t('unlockBody') }}</p>
      <button v-if="!watching" class="mt-5 w-full rounded-full bg-brand-500 py-3 font-semibold text-white active:scale-95" @click="watch">
        <Icon icon="solar:play-circle-bold" class="mr-1 inline" width="22" />{{ t('unlock') }}
      </button>
      <p v-else class="mt-5 rounded-full bg-brand-100 py-3 font-semibold">{{ t('watching') }} {{ left }}</p>
      <button class="mt-3 text-sm text-ink/50" @click="emit('close')">{{ t('cancel') }}</button>
    </div>
  </div>
</template>
