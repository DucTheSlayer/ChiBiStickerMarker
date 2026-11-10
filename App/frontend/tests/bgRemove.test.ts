import { describe, expect, it } from 'vitest';
import { estimateBorderColor, opaqueBounds, removeBackgroundInPlace } from '@/services/bgRemove';

/** Ảnh w×h nền trắng, hình vuông đỏ ở giữa. */
function makeImage(w: number, h: number, box: { x: number; y: number; s: number }) {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const inside = x >= box.x && x < box.x + box.s && y >= box.y && y < box.y + box.s;
      d[i] = 255; d[i + 1] = inside ? 0 : 255; d[i + 2] = inside ? 0 : 255; d[i + 3] = 255;
    }
  }
  return d;
}

describe('bgRemove', () => {
  const W = 40, H = 40;

  it('estimates border colour', () => {
    expect(estimateBorderColor(makeImage(W, H, { x: 10, y: 10, s: 20 }), W, H)).toEqual([255, 255, 255]);
  });

  it('removes white background but keeps the subject', () => {
    const d = makeImage(W, H, { x: 10, y: 10, s: 20 });
    const removed = removeBackgroundInPlace(d, W, H, 40, 0);
    expect(removed).toBe(W * H - 20 * 20);
    expect(d[(0 * W + 0) * 4 + 3]).toBe(0);
    expect(d[(20 * W + 20) * 4 + 3]).toBe(255);
  });

  it('does not remove enclosed regions of the same colour as background', () => {
    // Vòng đỏ (viền dày 2px) có lỗ trắng ở trong: lỗ phải được giữ.
    const d = makeImage(W, H, { x: 5, y: 5, s: 30 });
    for (let y = 10; y < 30; y++) for (let x = 10; x < 30; x++) { const i = (y * W + x) * 4; d[i + 1] = 255; d[i + 2] = 255; }
    removeBackgroundInPlace(d, W, H, 40, 0);
    expect(d[(20 * W + 20) * 4 + 3]).toBe(255);
  });

  it('feather softens edge pixels', () => {
    const d = makeImage(W, H, { x: 10, y: 10, s: 20 });
    removeBackgroundInPlace(d, W, H, 40, 2);
    const edge = d[(10 * W + 20) * 4 + 3]!;
    expect(edge).toBeGreaterThan(0);
    expect(edge).toBeLessThan(255);
  });

  it('computes opaque bounds', () => {
    const d = makeImage(W, H, { x: 10, y: 12, s: 8 });
    removeBackgroundInPlace(d, W, H, 40, 0);
    expect(opaqueBounds(d, W, H)).toEqual({ x: 10, y: 12, w: 8, h: 8 });
    expect(opaqueBounds(new Uint8ClampedArray(16), 2, 2)).toBeNull();
  });
});
