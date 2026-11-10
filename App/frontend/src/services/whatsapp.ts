import { Capacitor, registerPlugin } from '@capacitor/core';
import { blobToBase64, downloadBlob, makeTrayPng } from './imageExport';

/** Hợp đồng với plugin native Android (frontend/android-src). */
export interface StickerExportPlugin {
  isWhatsAppInstalled(): Promise<{ consumer: boolean; business: boolean }>;
  addPack(options: {
    identifier: string;
    name: string;
    publisher: string;
    trayPngBase64: string;
    stickers: { webpBase64: string; emojis: string[] }[];
    business: boolean;
  }): Promise<{ started: boolean }>;
}

const Native = registerPlugin<StickerExportPlugin>('StickerExport');

export interface ExportInput {
  id: string;
  name: string;
  publisher: string;
  stickers: { blob: Blob; emojis: string[] }[];
}

export class WhatsAppError extends Error {
  constructor(public code: 'NOT_INSTALLED' | 'TOO_FEW' | 'TOO_MANY' | 'FAILED', message: string) {
    super(message);
  }
}

export const whatsapp = {
  isNative: () => Capacitor.isNativePlatform(),

  async installed(): Promise<{ consumer: boolean; business: boolean }> {
    if (!Capacitor.isNativePlatform()) return { consumer: false, business: false };
    return Native.isWhatsAppInstalled();
  },

  /** Native: mở WhatsApp để xác nhận thêm pack. Web: tải các file WebP về máy. */
  async addPack(input: ExportInput, business = false): Promise<'added' | 'downloaded'> {
    if (input.stickers.length < 3) throw new WhatsAppError('TOO_FEW', 'A pack needs at least 3 stickers');
    if (input.stickers.length > 30) throw new WhatsAppError('TOO_MANY', 'A pack can hold at most 30 stickers');

    if (!Capacitor.isNativePlatform()) {
      input.stickers.forEach((s, i) => downloadBlob(s.blob, `${input.name}-${i + 1}.webp`));
      return 'downloaded';
    }
    const status = await Native.isWhatsAppInstalled();
    if (!(business ? status.business : status.consumer)) {
      throw new WhatsAppError('NOT_INSTALLED', 'WhatsApp is not installed');
    }
    try {
      await Native.addPack({
        identifier: input.id,
        name: input.name,
        publisher: input.publisher,
        trayPngBase64: await blobToBase64(await makeTrayPng(input.stickers[0]!.blob)),
        stickers: await Promise.all(input.stickers.map(async (s) => ({ webpBase64: await blobToBase64(s.blob), emojis: s.emojis.length ? s.emojis : ['🙂'] }))),
        business,
      });
      return 'added';
    } catch (e) {
      throw new WhatsAppError('FAILED', e instanceof Error ? e.message : 'Export failed');
    }
  },
};
