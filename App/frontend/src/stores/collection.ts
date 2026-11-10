import { defineStore } from 'pinia';
import { ref } from 'vue';
import { assetUrl } from '@/api/client';
import { catalogApi } from '@/api/catalog.api';
import { fileStore } from '@/services/fileStore';
import { svgUrlToWebp } from '@/services/imageExport';
import { kv } from '@/services/kv';
import type { LocalPack, LocalSticker } from '@/types';

const KEY = 'packs';
const rid = () => Math.random().toString(36).slice(2, 10);

export const useCollectionStore = defineStore('collection', () => {
  const packs = ref<LocalPack[]>([]);
  const loaded = ref(false);

  const persist = () => kv.set(KEY, packs.value);

  async function load() {
    if (loaded.value) return;
    packs.value = await kv.get<LocalPack[]>(KEY, []);
    loaded.value = true;
  }

  const byId = (id: string) => packs.value.find((p) => p.id === id);

  async function createPack(name: string): Promise<LocalPack> {
    const pack: LocalPack = { id: `p${Date.now().toString(36)}${rid()}`, name: name.trim() || 'My pack', publisher: 'Chibi Studio', createdAt: Date.now(), stickers: [] };
    packs.value.unshift(pack);
    await persist();
    return pack;
  }

  async function addSticker(packId: string, blob: Blob, emojis: string[] = ['🙂']): Promise<LocalSticker | null> {
    const pack = byId(packId);
    if (!pack || pack.stickers.length >= 30) return null;
    const s: LocalSticker = { id: rid(), emojis };
    await fileStore.put(`${packId}/${s.id}`, blob);
    pack.stickers.push(s);
    await persist();
    return s;
  }

  async function removeSticker(packId: string, stickerId: string) {
    const pack = byId(packId);
    if (!pack) return;
    pack.stickers = pack.stickers.filter((s) => s.id !== stickerId);
    await fileStore.remove(`${packId}/${stickerId}`);
    await persist();
  }

  async function renamePack(packId: string, name: string) {
    const pack = byId(packId);
    if (pack && name.trim()) { pack.name = name.trim(); await persist(); }
  }

  async function deletePack(packId: string) {
    const pack = byId(packId);
    if (!pack) return;
    await Promise.all(pack.stickers.map((s) => fileStore.remove(`${packId}/${s.id}`)));
    packs.value = packs.value.filter((p) => p.id !== packId);
    await persist();
  }

  async function stickerBlob(packId: string, stickerId: string): Promise<Blob | null> {
    return fileStore.get(`${packId}/${stickerId}`);
  }

  /** Sao chép một pack từ catalog (SVG → WebP 512) vào bộ sưu tập cục bộ. */
  async function importFromCatalog(catalogPackId: string): Promise<LocalPack> {
    const detail = await catalogApi.pack(catalogPackId);
    const pack = await createPack(detail.name);
    for (const s of detail.stickers) {
      await addSticker(pack.id, await svgUrlToWebp(assetUrl(s.url)), [s.emoji]);
    }
    return pack;
  }

  return { packs, loaded, load, byId, createPack, addSticker, removeSticker, renamePack, deletePack, stickerBlob, importFromCatalog };
});
