import { describe, expect, it } from 'vitest';
import { catalogApi } from '@/api/catalog.api';
import { assetUrl, CATALOG_SOURCE, HttpError } from '@/api/client';

describe('catalog chạy local (tầng service của backend trong app)', () => {
  it('mặc định dùng nguồn local', () => {
    expect(CATALOG_SOURCE).toBe('local');
  });

  it('trả dữ liệu giống API: danh mục, phân trang, chi tiết bộ', async () => {
    const cats = await catalogApi.categories();
    expect(cats.map((c) => c.id)).toContain('food');
    const page = await catalogApi.packs({ category: 'food' });
    expect(page.items[0]?.id).toBe('fluent-yummy');
    const pack = await catalogApi.pack('fluent-yummy');
    expect(pack.stickers.length).toBeGreaterThanOrEqual(3);
    expect((await catalogApi.config()).languages).toContain('vi');
  });

  it('asset thành data: URL chứa SVG', async () => {
    const pack = await catalogApi.pack('cat-moods');
    for (const url of [pack.trayUrl, pack.stickers[0]!.url]) {
      const u = assetUrl(url);
      expect(u.startsWith('data:image/svg+xml')).toBe(true);
      expect(decodeURIComponent(u)).toContain('<svg');
    }
    const decor = (await catalogApi.decorations())[0]!.items[0]!;
    expect(assetUrl(decor.url).startsWith('data:image/svg+xml')).toBe(true);
  });

  it('lỗi giống server: 404 và 400', async () => {
    await expect(catalogApi.pack('nope')).rejects.toMatchObject({ status: 404, code: 'PACK_NOT_FOUND' });
    await expect(catalogApi.packs({ pageSize: 999 })).rejects.toBeInstanceOf(HttpError);
  });

  it('dữ liệu trả về là bản sao, sửa không ảnh hưởng lần gọi sau', async () => {
    const a = await catalogApi.categories();
    a[0]!.emoji = 'X';
    expect((await catalogApi.categories())[0]!.emoji).not.toBe('X');
  });
});
