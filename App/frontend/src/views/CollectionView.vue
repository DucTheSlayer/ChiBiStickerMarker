<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import LocalStickerImg from '@/components/LocalStickerImg.vue';
import { useI18n } from '@/i18n';
import { useCollectionStore } from '@/stores/collection';

const { t } = useI18n();
const router = useRouter();
const collection = useCollectionStore();
const creating = ref(false);
const name = ref('');

async function create() {
  const p = await collection.createPack(name.value);
  name.value = '';
  creating.value = false;
  router.push(`/collection/${p.id}`);
}
</script>

<template>
  <div class="p-4 pb-24">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('collection') }}</h1>
      <button class="flex items-center gap-1 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white active:scale-95" @click="creating = true">
        <Icon icon="solar:add-circle-linear" width="20" />{{ t('newPack') }}
      </button>
    </div>

    <p v-if="collection.loaded && !collection.packs.length" class="mt-16 text-center text-ink/50">{{ t('emptyCollection') }}</p>

    <ul class="mt-4 grid grid-cols-2 gap-3">
      <li v-for="p in collection.packs" :key="p.id">
        <RouterLink :to="`/collection/${p.id}`" class="block rounded-3xl bg-white p-3 shadow-sm ring-1 ring-brand-100">
          <div class="aspect-square overflow-hidden rounded-2xl"><LocalStickerImg :pack-id="p.id" :sticker-id="p.stickers[0]?.id" /></div>
          <p class="mt-2 truncate text-sm font-semibold">{{ p.name }}</p>
          <p class="text-xs text-ink/50">{{ p.stickers.length }} {{ t('stickers') }}</p>
        </RouterLink>
      </li>
    </ul>

    <div v-if="creating" class="fixed inset-0 z-40 flex items-end justify-center bg-black/40" @click.self="creating = false">
      <form class="w-full max-w-md rounded-t-3xl bg-white p-6" @submit.prevent="create">
        <h2 class="text-lg font-semibold">{{ t('newPack') }}</h2>
        <input v-model="name" autofocus maxlength="40" :placeholder="t('packName')" class="mt-3 w-full rounded-2xl bg-brand-50 px-4 py-3 outline-none ring-1 ring-brand-100 focus:ring-brand-400" />
        <div class="mt-4 flex gap-2">
          <button type="button" class="flex-1 rounded-full bg-brand-100 py-3 font-semibold" @click="creating = false">{{ t('cancel') }}</button>
          <button type="submit" class="flex-1 rounded-full bg-brand-500 py-3 font-semibold text-white">{{ t('save') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
