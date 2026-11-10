/**
 * Tách nền cục bộ (không gửi ảnh lên server): flood-fill từ viền ảnh theo độ lệch màu,
 * rồi làm mềm (feather) mép. Hoạt động tốt với nền đơn sắc/ít chi tiết; phần còn lại
 * người dùng tinh chỉnh bằng cọ tẩy trong editor.
 */

function dist2(d: Uint8ClampedArray, i: number, r: number, g: number, b: number): number {
  const dr = d[i]! - r, dg = d[i + 1]! - g, db = d[i + 2]! - b;
  return dr * dr + dg * dg + db * db;
}

/** Màu nền ước lượng = trung vị từng kênh của các điểm trên viền. */
export function estimateBorderColor(d: Uint8ClampedArray, w: number, h: number): [number, number, number] {
  const rs: number[] = [], gs: number[] = [], bs: number[] = [];
  const push = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    if (d[i + 3]! < 16) return;
    rs.push(d[i]!); gs.push(d[i + 1]!); bs.push(d[i + 2]!);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  const med = (a: number[]) => (a.length ? a.sort((p, q) => p - q)[a.length >> 1]! : 255);
  return [med(rs), med(gs), med(bs)];
}

/** Sửa `data` tại chỗ. Trả số pixel đã xoá. `tolerance` 0–255 (khoảng cách Euclid). */
export function removeBackgroundInPlace(data: Uint8ClampedArray, w: number, h: number, tolerance = 48, feather = 2): number {
  const [br, bg, bb] = estimateBorderColor(data, w, h);
  const tol2 = tolerance * tolerance;
  const removed = new Uint8Array(w * h);
  const stack: number[] = [];
  const tryPush = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (removed[p]) return;
    const i = p * 4;
    if (data[i + 3]! < 16 || dist2(data, i, br, bg, bb) <= tol2) {
      removed[p] = 1;
      stack.push(p);
    }
  };
  for (let x = 0; x < w; x++) { tryPush(x, 0); tryPush(x, h - 1); }
  for (let y = 0; y < h; y++) { tryPush(0, y); tryPush(w - 1, y); }
  while (stack.length) {
    const p = stack.pop()!;
    const x = p % w, y = (p / w) | 0;
    tryPush(x + 1, y); tryPush(x - 1, y); tryPush(x, y + 1); tryPush(x, y - 1);
  }
  let count = 0;
  for (let p = 0; p < removed.length; p++) {
    if (removed[p]) { data[p * 4 + 3] = 0; count++; }
  }
  // Feather: pixel giữ lại nằm sát vùng đã xoá bị giảm alpha dần.
  for (let pass = 1; pass <= feather; pass++) {
    const edge: number[] = [];
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const p = y * w + x;
        if (data[p * 4 + 3] === 0) continue;
        if (data[(p - 1) * 4 + 3] === 0 || data[(p + 1) * 4 + 3] === 0 || data[(p - w) * 4 + 3] === 0 || data[(p + w) * 4 + 3] === 0) edge.push(p);
      }
    }
    const a = Math.round(255 * (pass / (feather + 1)));
    for (const p of edge) data[p * 4 + 3] = Math.min(data[p * 4 + 3]!, a);
  }
  return count;
}

/** Hộp bao của vùng không trong suốt, null nếu rỗng. */
export function opaqueBounds(data: Uint8ClampedArray, w: number, h: number): { x: number; y: number; w: number; h: number } | null {
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3]! > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Wrapper canvas: trả canvas mới đã tách nền và cắt sát vùng chủ thể. */
export function removeBackground(src: HTMLCanvasElement, tolerance = 48): HTMLCanvasElement {
  const ctx = src.getContext('2d', { willReadFrequently: true })!;
  const img = ctx.getImageData(0, 0, src.width, src.height);
  removeBackgroundInPlace(img.data, src.width, src.height, tolerance);
  const b = opaqueBounds(img.data, src.width, src.height) ?? { x: 0, y: 0, w: src.width, h: src.height };
  const out = document.createElement('canvas');
  out.width = b.w;
  out.height = b.h;
  const full = document.createElement('canvas');
  full.width = src.width;
  full.height = src.height;
  full.getContext('2d')!.putImageData(img, 0, 0);
  out.getContext('2d')!.drawImage(full, b.x, b.y, b.w, b.h, 0, 0, b.w, b.h);
  return out;
}

/** Đọc File ảnh → canvas, thu nhỏ cạnh dài còn `maxSide`. */
export async function fileToCanvas(file: Blob, maxSide = 1024): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(bmp.width * s));
  c.height = Math.max(1, Math.round(bmp.height * s));
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return c;
}
