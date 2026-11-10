<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import HowToUseDialog from '@/components/HowToUseDialog.vue';
import LocalStickerImg from '@/components/LocalStickerImg.vue';
import { useExportPack } from '@/composables/useExportPack';
import { useI18n } from '@/i18n';
import { useCollectionStore } from '@/stores/collection';

const props = defineProps<{ id: string }>();
const { t } = useI18n();
const router = useRouter();
const collection = useCollectionStore();
const { exportLocalPack, busy, showHowTo } = useExportPack();

const pack = computed(() => collection.byId(props.id));
const renaming = ref(false);
const newName = ref('');
const confirmDelete = ref(false);

function startRename() { newName.value = pack.value?.name ?? ''; renaming.value = true; }
async function doRename() { await collection.renamePack(props.id, newName.value); renaming.value = false; }
async function removePack() { await collection.deletePack(props.id); router.replace('/collection'); }
</script>

<template>
  <div v-if="pack" class="h-full overflow-y-auto pb-28">
    <header class="sticky top-0 z-10 flex items-center gap-2 bg-brand-50/90 p-3 backdrop-blur">
      <button class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" :aria-label="t('cancel')" @click="router.back()"><Icon icon="solar:alt-arrow-left-linear" width="22" /></button>
      <h1 class="flex-1 truncate text-lg font-semibold">{{ pack.name }}</h1>
      <button class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" :aria-label="t('rename')" @click="startRename"><Icon icon="solar:pen-linear" width="20" /></button>
      <button class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-sm" :aria-label="t('delete')" @click="confirmDelete = true"><Icon icon="solar:trash-bin-trash-linear" width="20" /></button>
    </header>

    <p class="px-4 text-sm text-ink/60">{{ pack.stickers.length }}/30 {{ t('stickers') }}</p>
    <div class="grid grid-cols-3 gap-2 p-4">
      <RouterLink :to="`/editor?pack=${pack.id}`" class="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-brand-400 text-brand-600">
        <Icon icon="solar:add-circle-bold" width="32" /><span class="text-xs font-semibold">{{ t('addSticker') }}</span>
      </RouterLink>
      <div v-for="s in pack.stickers" :key="s.id" class="group relative aspect-square overflow-hidden rounded-2xl">
        <LocalStickerImg :pack-id="pack.id" :sticker-id="s.id" />
        <button class="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-500 shadow" :aria-label="t('delete')" @click="collection.removeSticker(pack.id, s.id)">
          <Icon icon="solar:close-circle-bold" width="20" />
        </button>
      </div>
    </div>

    <div class="safe-bottom fixed inset-x-0 bottom-0 mx-auto max-w-md bg-white/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,.06)]">
      <button class="w-full rounded-full bg-emerald-500 py-3 font-semibold text-white active:scale-95 disabled:opacity-50" :disabled="busy" @click="exportLocalPack(pack.id)">
        <Icon icon="logos:whatsapp-icon" class="mr-1 inline" width="20" />{{ t('addToWhatsApp') }}
      </button>
    </div>

    <div v-if="renaming" class="fixed inset-0 z-40 flex items-end justify-center bg-black/40" @click.self="renaming = false">
      <form class="w-full max-w-md rounded-t-3xl bg-white p-6" @submit.prevent="doRename">
        <input v-model="newName" maxlength="40" class="w-full rounded-2xl bg-brand-50 px-4 py-3 outline-none ring-1 ring-brand-100 focus:ring-brand-400" />
        <div class="mt-4 flex gap-2">
          <button type="button" class="flex-1 rounded-full bg-brand-100 py-3 font-semibold" @click="renaming = false">{{ t('cancel') }}</button>
          <button type="submit" class="flex-1 rounded-full bg-brand-500 py-3 font-semibold text-white">{{ t('save') }}</button>
        </div>
      </form>
    </div>

    <div v-if="confirmDelete" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6" @click.self="confirmDelete = false">
      <div class="w-full max-w-sm rounded-3xl bg-white p-6 text-center">
        <p class="font-semibold">{{ t('delete') }} “{{ pack.name }}”?</p>
        <div class="mt-4 flex gap-2">
          <button class="flex-1 rounded-full bg-brand-100 py-3 font-semibold" @click="confirmDelete = false">{{ t('cancel') }}</button>
          <button class="flex-1 rounded-full bg-red-500 py-3 font-semibold text-white" @click="removePack">{{ t('delete') }}</button>
        </div>
      </div>
    </div>
    <HowToUseDialog v-if="showHowTo" @close="showHowTo = false" />
  </div>
  <p v-else class="p-8 text-center text-ink/50">{{ t('loading') }}</p>
</template>
