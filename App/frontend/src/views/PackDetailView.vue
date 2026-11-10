<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { assetUrl } from '@/api/client';
import { catalogApi } from '@/api/catalog.api';
import HowToUseDialog from '@/components/HowToUseDialog.vue';
import PackCard from '@/components/PackCard.vue';
import UnlockDialog from '@/components/UnlockDialog.vue';
import { toast } from '@/composables/useToast';
import { useI18n } from '@/i18n';
import { useCollectionStore } from '@/stores/collection';
import { useUnlockStore } from '@/stores/unlock';
import { useExportPack } from '@/composables/useExportPack';
import type { PackDetail } from '@/types';

const props = defineProps<{ id: string }>();
const { t } = useI18n();
const router = useRouter();
const unlock = useUnlockStore();
const collection = useCollectionStore();
const { exportLocalPack, busy, showHowTo } = useExportPack();

const pack = ref<PackDetail | null>(null);
const error = ref(false);
const showUnlock = ref(false);
const working = ref(false);

const locked = computed(() => !!pack.value?.premium && !unlock.isUnlocked(pack.value.id));

async function load() {
  pack.value = null;
  error.value = false;
  try { pack.value = await catalogApi.pack(props.id); } catch { error.value = true; }
}
onMounted(load);
watch(() => props.id, load);

async function save(): Promise<string | null> {
  if (!pack.value) return null;
  if (locked.value) { showUnlock.value = true; return null; }
  working.value = true;
  try {
    const local = await collection.importFromCatalog(pack.value.id);
    toast(t('saved'));
    return local.id;
  } catch {
    toast(t('offline'));
    return null;
  } finally {
    working.value = false;
  }
}

async function addToWhatsApp() {
  const id = await save();
  if (id) await exportLocalPack(id);
}

async function onUnlocked() {
  if (pack.value) await unlock.unlock(pack.value.id);
  showUnlock.value = false;
  toast(t('unlocked'));
}
</script>

<template>
  <div class="h-full overflow-y-auto pb-28">
    <header class="sticky top-0 z-10 flex items-center gap-2 bg-brand-50/90 p-3 backdrop-blur">
      <button class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" :aria-label="t('cancel')" @click="router.back()">
        <Icon icon="solar:alt-arrow-left-linear" width="22" />
      </button>
      <h1 class="truncate text-lg font-semibold">{{ pack?.name }}</h1>
    </header>

    <p v-if="error" class="m-4 rounded-2xl bg-white p-4 text-center text-sm">{{ t('offline') }}<button class="mt-2 block w-full font-semibold text-brand-600" @click="load">{{ t('retry') }}</button></p>

    <template v-if="pack">
      <p class="px-4 text-sm text-ink/60">{{ pack.publisher }} · {{ pack.stickerCount }} {{ t('stickers') }} · {{ pack.downloads.toLocaleString() }} {{ t('downloads') }}</p>
      <div class="grid grid-cols-3 gap-2 p-4">
        <div v-for="s in pack.stickers" :key="s.id" class="checker relative aspect-square overflow-hidden rounded-2xl">
          <img :src="assetUrl(s.url)" :alt="s.id" loading="lazy" class="h-full w-full object-contain p-1" :class="locked ? 'opacity-60' : ''" />
        </div>
      </div>

      <section v-if="pack.related.length" class="px-4">
        <h2 class="mb-2 font-semibold">{{ t('related') }}</h2>
        <div class="grid grid-cols-2 gap-3"><PackCard v-for="r in pack.related.slice(0, 4)" :key="r.id" :pack="r" /></div>
      </section>

      <div class="safe-bottom fixed inset-x-0 bottom-0 mx-auto flex max-w-md gap-2 bg-white/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,.06)]">
        <button class="flex-1 rounded-full bg-brand-100 py-3 font-semibold text-brand-600 active:scale-95 disabled:opacity-50" :disabled="working || busy" @click="locked ? (showUnlock = true) : save()">
          <Icon :icon="locked ? 'solar:lock-keyhole-bold' : 'solar:download-minimalistic-bold'" class="mr-1 inline" width="20" />{{ locked ? t('unlock') : t('addToCollection') }}
        </button>
        <button class="flex-1 rounded-full bg-emerald-500 py-3 font-semibold text-white active:scale-95 disabled:opacity-50" :disabled="working || busy || locked" @click="addToWhatsApp">
          <Icon icon="logos:whatsapp-icon" class="mr-1 inline" width="20" />WhatsApp
        </button>
      </div>
    </template>
    <p v-else-if="!error" class="p-8 text-center text-ink/50">{{ t('loading') }}</p>

    <UnlockDialog v-if="showUnlock" @close="showUnlock = false" @unlocked="onUnlocked" />
    <HowToUseDialog v-if="showHowTo" @close="showHowTo = false" />
  </div>
</template>
