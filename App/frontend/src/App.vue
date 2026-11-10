<script setup lang="ts">
import AppToast from '@/components/AppToast.vue';
</script>

<template>
  <div class="mx-auto h-full max-w-md bg-brand-50 text-ink shadow-xl">
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
    <AppToast />
  </div>
</template>
