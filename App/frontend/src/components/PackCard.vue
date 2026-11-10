<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { assetUrl } from '@/api/client';
import { useI18n } from '@/i18n';
import { useUnlockStore } from '@/stores/unlock';
import type { PackSummary } from '@/types';

const props = defineProps<{ pack: PackSummary }>();
const { t } = useI18n();
const unlock = useUnlockStore();
</script>

<template>
  <RouterLink :to="`/pack/${props.pack.id}`" class="block rounded-3xl bg-white p-3 shadow-sm ring-1 ring-brand-100 active:scale-[0.98]">
    <div class="checker relative aspect-square overflow-hidden rounded-2xl">
      <img :src="assetUrl(props.pack.trayUrl)" :alt="props.pack.name" loading="lazy" class="h-full w-full object-contain p-2" />
      <span v-if="props.pack.premium && !unlock.isUnlocked(props.pack.id)" class="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-ink">
        <Icon icon="solar:crown-bold" width="12" />{{ t('premium') }}
      </span>
    </div>
    <p class="mt-2 truncate text-sm font-semibold">{{ props.pack.name }}</p>
    <p class="text-xs text-ink/50">{{ props.pack.stickerCount }} {{ t('stickers') }} · {{ props.pack.downloads.toLocaleString() }}</p>
  </RouterLink>
</template>
