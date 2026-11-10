<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRoute } from 'vue-router';
import { useI18n } from '@/i18n';

const { t } = useI18n();
const route = useRoute();
const tabs = [
  { to: '/home', icon: 'solar:home-2-bold-duotone', key: 'home' },
  { to: '/collection', icon: 'solar:album-bold-duotone', key: 'collection' },
  { to: '/settings', icon: 'solar:settings-bold-duotone', key: 'settings' },
] as const;
</script>

<template>
  <div class="flex h-full flex-col">
    <main class="min-h-0 flex-1 overflow-y-auto">
      <RouterView />
    </main>
    <nav class="safe-bottom relative flex items-end justify-around border-t border-brand-100 bg-white px-4 pt-2">
      <RouterLink
        v-for="tab in tabs" :key="tab.to" :to="tab.to"
        class="flex w-20 flex-col items-center gap-0.5 pb-2 text-xs"
        :class="route.path === tab.to ? 'text-brand-600' : 'text-ink/50'"
      >
        <Icon :icon="tab.icon" width="26" />
        {{ t(tab.key) }}
      </RouterLink>
      <RouterLink
        to="/editor" :aria-label="t('create')"
        class="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg ring-4 ring-brand-50 active:scale-95"
      >
        <Icon icon="solar:add-circle-bold" width="34" />
      </RouterLink>
    </nav>
  </div>
</template>
