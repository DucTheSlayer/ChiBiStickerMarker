<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { assetUrl } from '@/api/client';
import UnlockDialog from '@/components/UnlockDialog.vue';
import { toast } from '@/composables/useToast';
import { StickerEditor, type TextLayer } from '@/editor/engine';
import { useI18n } from '@/i18n';
import { fileToCanvas, removeBackground } from '@/services/bgRemove';
import { useCatalogStore } from '@/stores/catalog';
import { useCollectionStore } from '@/stores/collection';
import { useUnlockStore } from '@/stores/unlock';

const props = defineProps<{ packId?: string }>();
const { t } = useI18n();
const router = useRouter();
const catalog = useCatalogStore();
const collection = useCollectionStore();
const unlock = useUnlockStore();

type Panel = 'none' | 'bg' | 'brush' | 'erase' | 'text' | 'decor' | 'color' | 'layers';
const canvasEl = ref<HTMLCanvasElement | null>(null);
const fileEl = ref<HTMLInputElement | null>(null);
const editor = shallowRef<StickerEditor | null>(null);
const tick = ref(0); // tăng mỗi khi engine đổi → làm tươi UI
const panel = ref<Panel>('none');
const tolerance = ref(48);
const busy = ref(false);
const showUnlock = ref<string | null>(null);
const showSave = ref(false);
const confirmLeave = ref(false);
const newPackName = ref('');
const textDraft = ref('');
const originals = new Map<string, HTMLCanvasElement>();

const COLORS = ['#ffffff', '#3a2a3f', '#ff6aa0', '#ff8a5b', '#ffd54a', '#7ed957', '#4fc3f7', '#9575ff', '#ff5252'];
const BG_COLORS = [null, '#ffffff', '#ffe0ec', '#fff3a0', '#d6f5e3', '#d6ecff', '#e6dcff', '#3a2a3f'];

onMounted(() => {
  // Tạo editor ngay (không chờ mạng); tài nguyên phụ (font/decoration) tải nền.
  const e = new StickerEditor(canvasEl.value!);
  e.onChange(() => { tick.value++; });
  editor.value = e;
  void Promise.all([catalog.loadEditorAssets(), collection.load(), unlock.load()]);
});
onBeforeUnmount(() => editor.value?.destroy());

// Engine là object có thể biến đổi tại chỗ → computed sẽ bị cache vì cùng tham chiếu.
// Dùng hàm đọc `tick` trực tiếp để mọi lần engine thay đổi, template render lại.
function ed() { void tick.value; return editor.value; }
function sel() { return ed()?.selected; }
function textSel(): TextLayer | null { const l = sel(); return l?.kind === 'text' ? (l as TextLayer) : null; }
function hasContent() { return (ed()?.layers.length ?? 0) > 0; }
function hasImage() { return ed()?.layers.some((l) => l.kind === 'image') ?? false; }
function selectedImageId() {
  const l = sel();
  return l?.kind === 'image' ? l.id : ed()?.layers.find((x) => x.kind === 'image')?.id;
}

function setTool(tool: 'move' | 'brush' | 'erase') { if (editor.value) { editor.value.tool = tool; tick.value++; } }
function openPanel(p: Panel) {
  panel.value = panel.value === p ? 'none' : p;
  setTool(panel.value === 'brush' ? 'brush' : panel.value === 'erase' ? 'erase' : 'move');
}

async function onPickFile(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file || !editor.value) return;
  busy.value = true;
  try {
    const canvas = await fileToCanvas(file);
    editor.value.addImage(canvas);
    originals.set(editor.value.selectedId!, canvas);
    openPanel('none');
  } catch {
    toast(t('exportFailed'));
  } finally {
    busy.value = false;
  }
}

function applyRemoveBg() {
  const id = selectedImageId();
  const e = editor.value;
  if (!id || !e) return;
  const src = originals.get(id);
  if (!src) return;
  busy.value = true;
  // chạy sau 1 frame để UI kịp hiện trạng thái busy
  requestAnimationFrame(() => {
    try { e.replaceImageCanvas(id, removeBackground(src, tolerance.value)); } finally { busy.value = false; }
  });
}

function addText() {
  const text = textDraft.value.trim();
  if (!text || !editor.value) return;
  editor.value.addText(text);
  textDraft.value = '';
}

function pickFont(id: string, family: string, premium: boolean) {
  if (premium && !unlock.isUnlocked(`font:${id}`)) { showUnlock.value = `font:${id}`; return; }
  editor.value?.updateText({ font: family });
}

async function addDecor(groupId: string, premium: boolean, url: string) {
  if (premium && !unlock.isUnlocked(`decor:${groupId}`)) { showUnlock.value = `decor:${groupId}`; return; }
  try { await editor.value?.addDecor(assetUrl(url)); } catch { toast(t('offline')); }
}

async function onUnlocked() {
  if (showUnlock.value) await unlock.unlock(showUnlock.value);
  showUnlock.value = null;
  toast(t('unlocked'));
}

function back() { if (hasContent()) confirmLeave.value = true; else router.back(); }

async function save(targetPackId?: string) {
  const e = editor.value;
  if (!e) return;
  busy.value = true;
  try {
    let id = targetPackId ?? props.packId;
    if (!id) {
      id = (await collection.createPack(newPackName.value || 'My pack')).id;
    }
    const blob = await e.exportBlob();
    const ok = await collection.addSticker(id, blob);
    if (!ok) { toast('Pack is full (30)'); return; }
    toast(t('saved'));
    await router.replace(`/collection/${id}`);
  } finally {
    busy.value = false;
  }
}

function onSaveClick() {
  if (!hasContent()) return;
  if (props.packId) save(props.packId); else showSave.value = true;
}

const tools = () => [
  { id: 'bg' as const, icon: 'solar:magic-stick-3-bold-duotone', label: t('removeBg'), need: hasImage() },
  { id: 'erase' as const, icon: 'solar:eraser-bold-duotone', label: t('eraser'), need: hasImage() },
  { id: 'brush' as const, icon: 'solar:pen-new-round-bold-duotone', label: t('brush'), need: true },
  { id: 'text' as const, icon: 'solar:text-bold-duotone', label: t('text'), need: true },
  { id: 'decor' as const, icon: 'solar:sticker-smile-circle-2-bold-duotone', label: t('stickerTab'), need: true },
  { id: 'color' as const, icon: 'solar:palette-bold-duotone', label: t('background'), need: true },
  { id: 'layers' as const, icon: 'solar:layers-minimalistic-bold-duotone', label: t('layers'), need: true },
];
</script>

<template>
  <div class="flex h-full flex-col bg-brand-50">
    <header class="flex items-center gap-1 p-3">
      <button class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" :aria-label="t('cancel')" @click="back"><Icon icon="solar:alt-arrow-left-linear" width="22" /></button>
      <div class="flex-1" />
      <button class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-30" :disabled="!ed()?.canUndo" :aria-label="t('undo')" @click="editor?.undo()"><Icon icon="solar:undo-left-round-bold" width="22" /></button>
      <button class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-30" :disabled="!ed()?.canRedo" :aria-label="t('redo')" @click="editor?.redo()"><Icon icon="solar:undo-right-round-bold" width="22" /></button>
      <button class="ml-1 rounded-full bg-brand-500 px-5 py-2 font-semibold text-white disabled:opacity-40" :disabled="!hasContent() || busy" @click="onSaveClick">{{ t('save') }}</button>
    </header>

    <div class="relative mx-auto aspect-square w-full max-w-[min(100%,52vh)] px-3">
      <canvas ref="canvasEl" class="checker h-full w-full rounded-3xl shadow-inner ring-1 ring-brand-100" />
      <button v-if="!hasContent() && editor" class="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-3xl text-brand-600" @click="fileEl?.click()">
        <Icon icon="solar:gallery-add-bold-duotone" width="64" /><span class="font-semibold">{{ t('pickPhoto') }}</span>
      </button>
      <p v-if="busy" class="absolute inset-x-0 top-4 mx-auto w-fit rounded-full bg-ink px-4 py-1 text-xs text-white">{{ t('loading') }}</p>
    </div>
    <input ref="fileEl" type="file" accept="image/*" class="hidden" @change="onPickFile" />

    <!-- Panel ngữ cảnh -->
    <div class="min-h-[7.5rem] flex-1 overflow-y-auto px-4 py-2">
      <template v-if="panel === 'bg'">
        <label class="text-sm font-semibold">{{ t('tolerance') }}: {{ tolerance }}</label>
        <input v-model.number="tolerance" type="range" min="10" max="140" class="w-full accent-brand-500" @change="applyRemoveBg" />
        <button class="mt-2 w-full rounded-full bg-brand-500 py-2 font-semibold text-white" :disabled="busy" @click="applyRemoveBg">{{ t('removeBg') }}</button>
      </template>

      <template v-else-if="panel === 'erase'">
        <label class="text-sm font-semibold">{{ t('size') }}: {{ ed()?.eraserSize }}</label>
        <input :value="ed()?.eraserSize" type="range" min="8" max="90" class="w-full accent-brand-500" @input="editor && (editor.eraserSize = +($event.target as HTMLInputElement).value, tick++)" />
      </template>

      <template v-else-if="panel === 'brush'">
        <label class="text-sm font-semibold">{{ t('size') }}: {{ ed()?.brush.size }}</label>
        <input :value="ed()?.brush.size" type="range" min="4" max="60" class="w-full accent-brand-500" @input="editor && (editor.brush.size = +($event.target as HTMLInputElement).value, tick++)" />
        <div class="mt-2 flex flex-wrap gap-2">
          <button v-for="c in COLORS" :key="c" class="h-8 w-8 rounded-full ring-2" :class="ed()?.brush.color === c ? 'ring-brand-500' : 'ring-brand-100'" :style="{ background: c }" :aria-label="c" @click="editor && (editor.brush.color = c, tick++)" />
        </div>
      </template>

      <template v-else-if="panel === 'text'">
        <form class="flex gap-2" @submit.prevent="addText">
          <input v-model="textDraft" maxlength="30" :placeholder="t('yourText')" class="min-w-0 flex-1 rounded-full bg-white px-4 py-2 outline-none ring-1 ring-brand-100 focus:ring-brand-400" />
          <button class="rounded-full bg-brand-500 px-4 font-semibold text-white">{{ t('addText') }}</button>
        </form>
        <template v-if="textSel()">
          <input :value="textSel()!.text" maxlength="30" class="mt-2 w-full rounded-full bg-white px-4 py-2 outline-none ring-1 ring-brand-100" @input="editor?.updateText({ text: ($event.target as HTMLInputElement).value })" />
          <div class="mt-2 flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="f in catalog.fonts" :key="f.id" class="flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-sm ring-2"
              :class="textSel()!.font === f.family ? 'ring-brand-500' : 'ring-transparent'" :style="{ fontFamily: `'${f.family}'` }"
              @click="pickFont(f.id, f.family, f.premium)"
            >
              <Icon v-if="f.premium && !unlock.isUnlocked(`font:${f.id}`)" icon="solar:lock-keyhole-bold" width="14" />{{ f.label }}
            </button>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <button v-for="c in COLORS" :key="c" class="h-8 w-8 rounded-full ring-2" :class="textSel()!.color === c ? 'ring-brand-500' : 'ring-brand-100'" :style="{ background: c }" :aria-label="c" @click="editor?.updateText({ color: c })" />
          </div>
          <label class="mt-2 block text-sm font-semibold">{{ t('outline') }}</label>
          <input :value="textSel()!.strokeWidth" type="range" min="0" max="16" class="w-full accent-brand-500" @input="editor?.updateText({ strokeWidth: +($event.target as HTMLInputElement).value })" />
        </template>
      </template>

      <template v-else-if="panel === 'decor'">
        <div v-for="g in catalog.decorations" :key="g.id" class="mb-2">
          <p class="flex items-center gap-1 text-xs font-semibold text-ink/60">
            {{ g.name }}<Icon v-if="g.premium && !unlock.isUnlocked(`decor:${g.id}`)" icon="solar:lock-keyhole-bold" width="12" />
          </p>
          <div class="flex gap-2 overflow-x-auto">
            <button v-for="i in g.items" :key="i.id" class="checker h-14 w-14 shrink-0 overflow-hidden rounded-xl" @click="addDecor(g.id, g.premium, i.url)">
              <img :src="assetUrl(i.url)" alt="" class="h-full w-full object-contain p-1" />
            </button>
          </div>
        </div>
        <p v-if="!catalog.decorations.length" class="text-sm text-ink/50">{{ t('offline') }}</p>
      </template>

      <template v-else-if="panel === 'color'">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="c in BG_COLORS" :key="String(c)" class="h-9 w-9 rounded-full ring-2" :class="[ed()?.background.color === c ? 'ring-brand-500' : 'ring-brand-100', c ? '' : 'checker']"
            :style="c ? { background: c } : {}" :aria-label="c ?? 'none'" @click="editor?.setBackground(c)"
          />
        </div>
      </template>

      <template v-else-if="panel === 'layers'">
        <ul class="space-y-1">
          <li v-for="l in [...(ed()?.layers ?? [])].reverse()" :key="l.id">
            <div class="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 ring-2" :class="ed()?.selectedId === l.id ? 'ring-brand-500' : 'ring-transparent'">
              <button class="flex flex-1 items-center gap-2 text-left text-sm" @click="editor?.select(l.id)">
                <Icon :icon="l.kind === 'text' ? 'solar:text-bold' : l.kind === 'image' ? 'solar:gallery-bold' : l.kind === 'paint' ? 'solar:pen-bold' : 'solar:sticker-smile-circle-bold'" width="18" />
                <span class="truncate">{{ l.kind === 'text' ? l.text : l.kind }}</span>
              </button>
              <button :aria-label="'toggle ' + l.kind" @click="editor?.toggleHidden(l.id)"><Icon :icon="l.hidden ? 'solar:eye-closed-linear' : 'solar:eye-linear'" width="20" /></button>
            </div>
          </li>
        </ul>
      </template>

      <template v-else-if="!hasContent()">
        <p class="pt-4 text-center text-sm text-ink/40">{{ t('pickPhoto') }} ↑</p>
      </template>
    </div>

    <!-- Điều chỉnh layer đang chọn -->
    <div v-if="sel() && sel()!.kind !== 'paint'" class="flex items-center gap-2 border-t border-brand-100 bg-white px-3 py-2">
      <Icon icon="solar:maximize-square-linear" width="18" />
      <input :value="sel()!.transform.scale" type="range" min="0.1" max="4" step="0.01" class="w-24 accent-brand-500" :aria-label="t('size')" @pointerdown="editor?.beginAdjust()" @input="editor?.adjustSelected({ scale: +($event.target as HTMLInputElement).value })" />
      <Icon icon="solar:restart-linear" width="18" />
      <input :value="sel()!.transform.rotation" type="range" min="-3.14" max="3.14" step="0.01" class="w-24 accent-brand-500" :aria-label="t('rotate')" @pointerdown="editor?.beginAdjust()" @input="editor?.adjustSelected({ rotation: +($event.target as HTMLInputElement).value })" />
      <div class="ml-auto flex gap-1">
        <button :aria-label="t('duplicate')" @click="editor?.duplicateSelected()"><Icon icon="solar:copy-linear" width="22" /></button>
        <button :aria-label="t('front')" @click="editor?.move('up')"><Icon icon="solar:round-alt-arrow-up-linear" width="22" /></button>
        <button :aria-label="t('back')" @click="editor?.move('down')"><Icon icon="solar:round-alt-arrow-down-linear" width="22" /></button>
        <button class="text-red-500" :aria-label="t('delete')" @click="editor?.removeSelected()"><Icon icon="solar:trash-bin-trash-linear" width="22" /></button>
      </div>
    </div>

    <nav class="safe-bottom flex gap-1 overflow-x-auto bg-white px-2 pt-2">
      <button class="flex w-16 shrink-0 flex-col items-center gap-0.5 pb-2 text-[11px] text-ink/70" @click="fileEl?.click()"><Icon icon="solar:gallery-add-bold-duotone" width="26" />{{ t('pickPhoto') }}</button>
      <button
        v-for="tool in tools()" :key="tool.id" :disabled="!tool.need" class="flex w-16 shrink-0 flex-col items-center gap-0.5 pb-2 text-[11px] disabled:opacity-30"
        :class="panel === tool.id ? 'text-brand-600' : 'text-ink/70'" @click="openPanel(tool.id)"
      ><Icon :icon="tool.icon" width="26" />{{ tool.label }}</button>
    </nav>

    <!-- Chọn nơi lưu -->
    <div v-if="showSave" class="fixed inset-0 z-40 flex items-end justify-center bg-black/40" @click.self="showSave = false">
      <div class="max-h-[80%] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6">
        <h2 class="text-lg font-semibold">{{ t('chooseTarget') }}</h2>
        <ul class="mt-3 space-y-2">
          <li v-for="p in collection.packs.filter((x) => x.stickers.length < 30)" :key="p.id">
            <button class="flex w-full items-center justify-between rounded-2xl bg-brand-50 px-4 py-3 text-left" @click="save(p.id)">
              <span class="truncate font-semibold">{{ p.name }}</span><span class="text-xs text-ink/50">{{ p.stickers.length }}/30</span>
            </button>
          </li>
        </ul>
        <form class="mt-4 flex gap-2" @submit.prevent="save()">
          <input v-model="newPackName" maxlength="40" :placeholder="t('newPack')" class="min-w-0 flex-1 rounded-full bg-brand-50 px-4 py-2 outline-none ring-1 ring-brand-100" />
          <button class="rounded-full bg-brand-500 px-5 font-semibold text-white">{{ t('save') }}</button>
        </form>
      </div>
    </div>

    <div v-if="confirmLeave" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6" @click.self="confirmLeave = false">
      <div class="w-full max-w-sm rounded-3xl bg-white p-6 text-center">
        <p class="font-semibold">{{ t('discard') }}</p>
        <p class="mt-1 text-sm text-ink/60">{{ t('discardBody') }}</p>
        <div class="mt-4 flex gap-2">
          <button class="flex-1 rounded-full bg-brand-100 py-3 font-semibold" @click="confirmLeave = false">{{ t('cancel') }}</button>
          <button class="flex-1 rounded-full bg-red-500 py-3 font-semibold text-white" @click="router.back()">{{ t('delete') }}</button>
        </div>
      </div>
    </div>

    <UnlockDialog v-if="showUnlock" @close="showUnlock = null" @unlocked="onUnlocked" />
  </div>
</template>
