import { defineStore } from 'pinia';
import { ref } from 'vue';
import { kv } from '@/services/kv';

/** Mở khoá nội dung premium (hiện tại mô phỏng "xem reward"; điểm gắn cho SDK ads thật). */
export const useUnlockStore = defineStore('unlock', () => {
  const ids = ref<string[]>([]);

  async function load() { ids.value = await kv.get<string[]>('unlocked', []); }
  const isUnlocked = (id: string) => ids.value.includes(id);
  async function unlock(id: string) {
    if (isUnlocked(id)) return;
    ids.value = [...ids.value, id];
    await kv.set('unlocked', ids.value);
  }
  return { ids, load, isUnlocked, unlock };
});
