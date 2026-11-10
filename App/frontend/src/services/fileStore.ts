import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

/**
 * Lưu file nhị phân (sticker WebP). Native: Filesystem (Directory.Data). Web: IndexedDB.
 * Key dạng "packId/stickerId".
 */
export interface FileStore {
  put(key: string, blob: Blob): Promise<void>;
  get(key: string): Promise<Blob | null>;
  remove(key: string): Promise<void>;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

function base64ToBlob(b64: string, type: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

const nativeStore: FileStore = {
  async put(key, blob) {
    await Filesystem.writeFile({ path: `stickers/${key}.webp`, data: await blobToBase64(blob), directory: Directory.Data, recursive: true });
  },
  async get(key) {
    try {
      const r = await Filesystem.readFile({ path: `stickers/${key}.webp`, directory: Directory.Data });
      return base64ToBlob(String(r.data), 'image/webp');
    } catch {
      return null;
    }
  },
  async remove(key) {
    try { await Filesystem.deleteFile({ path: `stickers/${key}.webp`, directory: Directory.Data }); } catch { /* không tồn tại */ }
  },
};

const DB = 'chibi-files';
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('files');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then((db) => new Promise<T>((resolve, reject) => {
    const req = run(db.transaction('files', mode).objectStore('files'));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

const webStore: FileStore = {
  async put(key, blob) { await tx('readwrite', (s) => s.put(blob, key)); },
  async get(key) { return ((await tx('readonly', (s) => s.get(key))) as Blob | undefined) ?? null; },
  async remove(key) { await tx('readwrite', (s) => s.delete(key)); },
};

export const fileStore: FileStore = Capacitor.isNativePlatform() ? nativeStore : webStore;
