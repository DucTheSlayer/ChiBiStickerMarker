<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from 'vue';
import { useCollectionStore } from '@/stores/collection';

const props = defineProps<{ packId: string; stickerId: string | undefined }>();
const collection = useCollectionStore();
const url = ref<string | null>(null);
let current: string | null = null;

watchEffect(async () => {
  const { packId, stickerId } = props;
  if (!stickerId) { url.value = null; return; }
  const blob = await collection.stickerBlob(packId, stickerId);
  if (current) URL.revokeObjectURL(current);
  current = blob ? URL.createObjectURL(blob) : null;
  url.value = current;
});
onBeforeUnmount(() => { if (current) URL.revokeObjectURL(current); });
</script>

<template>
  <div class="checker flex h-full w-full items-center justify-center overflow-hidden">
    <img v-if="url" :src="url" alt="" class="h-full w-full object-contain p-1" />
    <span v-else class="text-2xl opacity-30">🖼️</span>
  </div>
</template>
