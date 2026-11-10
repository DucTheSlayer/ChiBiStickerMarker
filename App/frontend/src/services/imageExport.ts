/** Giới hạn của WhatsApp: sticker tĩnh 512x512 WebP ≤ 100 KB; tray 96x96 ≤ 50 KB. */
export const STICKER_SIZE = 512;
export const MAX_STICKER_BYTES = 100 * 1024;
export const TRAY_SIZE = 96;

function toBlob(c: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), type, quality);
  });
}

/** Xuất WebP, giảm chất lượng dần cho tới khi ≤ maxBytes. */
export async function canvasToWebp(c: HTMLCanvasElement, maxBytes = MAX_STICKER_BYTES): Promise<Blob> {
  let q = 0.92;
  let blob = await toBlob(c, 'image/webp', q);
  while (blob.size > maxBytes && q > 0.2) {
    q -= 0.12;
    blob = await toBlob(c, 'image/webp', q);
  }
  return blob;
}

export async function canvasToPng(c: HTMLCanvasElement): Promise<Blob> {
  return toBlob(c, 'image/png');
}

export async function blobToCanvas(blob: Blob, size = STICKER_SIZE): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(blob);
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const s = Math.min(size / bmp.width, size / bmp.height);
  c.getContext('2d')!.drawImage(bmp, (size - bmp.width * s) / 2, (size - bmp.height * s) / 2, bmp.width * s, bmp.height * s);
  bmp.close();
  return c;
}

export async function makeTrayPng(sticker: Blob): Promise<Blob> {
  return canvasToPng(await blobToCanvas(sticker, TRAY_SIZE));
}

/** Rasterize SVG (từ backend) thành sticker WebP 512x512. */
export async function svgUrlToWebp(url: string): Promise<Blob> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error(`Cannot load ${url}`));
    img.src = url;
  });
  const c = document.createElement('canvas');
  c.width = STICKER_SIZE;
  c.height = STICKER_SIZE;
  c.getContext('2d')!.drawImage(img, 0, 0, STICKER_SIZE, STICKER_SIZE);
  return canvasToWebp(c);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
