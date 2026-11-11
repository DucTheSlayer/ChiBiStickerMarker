<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { assetUrl } from '@/api/client';
import { useI18n } from '@/i18n';
import { useUnlockStore } from '@/stores/unlock';
import type { PackSummary } from '@/types';
import { compactNumber, packTint } from '@/utils/tint';

const props = defineProps<{ pack: PackSummary }>();
const { t } = useI18n();
const unlock = useUnlockStore();
</script>

<template>
  <RouterLink
    :to="`/pack/${props.pack.id}`"
    class="block rounded-[28px] bg-white p-2.5 shadow-card transition-transform duration-150 active:scale-[0.97]"
  >
    <div class="relative aspect-square overflow-hidden rounded-[20px]" :class="packTint(props.pack.id)">
      <span class="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/45" />
      <span class="absolute -bottom-6 -left-4 h-16 w-16 rounded-full bg-white/30" />
      <img
        :src="assetUrl(props.pack.trayUrl)" :alt="props.pack.name" loading="lazy"
        class="relative h-full w-full object-contain p-3 drop-shadow-[0_6px_6px_rgba(58,42,63,0.16)]"
      />
      <span
        v-if="props.pack.premium && !unlock.isUnlocked(props.pack.id)"
        class="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-ink shadow-sm"
      >
        <Icon icon="solar:crown-bold" width="12" />{{ t('premium') }}
      </span>
    </div>
    <p class="mt-2.5 truncate px-1 text-[15px] font-semibold leading-tight">{{ props.pack.name }}</p>
    <p class="mt-1 flex items-center gap-3 px-1 pb-1 text-xs text-ink/55">
      <span class="flex items-center gap-1" :aria-label="`${props.pack.stickerCount} ${t('stickers')}`">
        <Icon icon="solar:sticker-smile-circle-2-linear" width="14" />{{ props.pack.stickerCount }}
      </span>
      <span class="flex items-center gap-1" :aria-label="`${props.pack.downloads.toLocaleString()} ${t('downloads')}`">
        <Icon icon="solar:download-minimalistic-linear" width="14" />{{ compactNumber(props.pack.downloads) }}
      </span>
    </p>
  </RouterLink>
</template>
