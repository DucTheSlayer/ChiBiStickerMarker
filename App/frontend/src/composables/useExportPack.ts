import { ref } from 'vue';
import { toast } from '@/composables/useToast';
import { useI18n } from '@/i18n';
import { whatsapp, WhatsAppError } from '@/services/whatsapp';
import { useCollectionStore } from '@/stores/collection';

/** Gom logic xuất pack cục bộ sang WhatsApp, dùng chung cho PackDetail và CollectionDetail. */
export function useExportPack() {
  const { t } = useI18n();
  const collection = useCollectionStore();
  const busy = ref(false);
  const showHowTo = ref(false);

  async function exportLocalPack(packId: string, business = false) {
    const pack = collection.byId(packId);
    if (!pack) return;
    if (pack.stickers.length < 3) { toast(t('needThree')); return; }
    busy.value = true;
    try {
      const stickers: { blob: Blob; emojis: string[] }[] = [];
      for (const s of pack.stickers) {
        const blob = await collection.stickerBlob(pack.id, s.id);
        if (blob) stickers.push({ blob, emojis: s.emojis });
      }
      const result = await whatsapp.addPack({ id: pack.id, name: pack.name, publisher: pack.publisher, stickers }, business);
      toast(result === 'added' ? t('waStarted') : t('waDownloaded'));
      showHowTo.value = true;
    } catch (e) {
      if (e instanceof WhatsAppError && e.code === 'NOT_INSTALLED') toast(t('waMissing'));
      else if (e instanceof WhatsAppError && e.code === 'TOO_FEW') toast(t('needThree'));
      else toast(t('exportFailed'));
    } finally {
      busy.value = false;
    }
  }

  return { exportLocalPack, busy, showHowTo };
}
