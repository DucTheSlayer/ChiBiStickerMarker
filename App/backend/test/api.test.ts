import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('API', () => {
  it('health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('config + categories + fonts + decorations', async () => {
    expect((await request(app).get('/api/config')).body.minVersion).toBeTypeOf('string');
    expect((await request(app).get('/api/categories')).body.length).toBeGreaterThan(3);
    expect((await request(app).get('/api/fonts')).body[0].family).toBeTypeOf('string');
    const dec = (await request(app).get('/api/decorations')).body;
    expect(dec[0].items[0].url).toMatch(/^\/assets\/decor\//);
  });

  it('paginates packs', async () => {
    const p1 = await request(app).get('/api/packs?page=1&pageSize=5');
    expect(p1.body.items).toHaveLength(5);
    expect(p1.body.hasMore).toBe(true);
    const last = await request(app).get(`/api/packs?page=${Math.ceil(p1.body.total / 5)}&pageSize=5`);
    expect(last.body.hasMore).toBe(false);
  });

  it('filters by category and query', async () => {
    const res = await request(app).get('/api/packs?category=love');
    expect(res.body.items.every((p: { categoryId: string }) => p.categoryId === 'love')).toBe(true);
    const q = await request(app).get('/api/packs?q=neko');
    expect(q.body.items.length).toBeGreaterThan(0);
  });

  it('rejects bad query', async () => {
    const res = await request(app).get('/api/packs?pageSize=999');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_QUERY');
  });

  it('pack detail + 404', async () => {
    const res = await request(app).get('/api/packs/cat-moods');
    expect(res.status).toBe(200);
    expect(res.body.stickers.length).toBeGreaterThanOrEqual(3);
    expect(res.body.related.length).toBeGreaterThan(0);
    const nf = await request(app).get('/api/packs/nope');
    expect(nf.status).toBe(404);
    expect(nf.body.error.code).toBe('PACK_NOT_FOUND');
  });

  it('serves svg assets', async () => {
    const res = await request(app)
      .get('/assets/packs/cat-moods/happy.svg')
      .buffer(true)
      .parse((r, cb) => {
        let d = '';
        r.setEncoding('utf8');
        r.on('data', (c: string) => (d += c));
        r.on('end', () => cb(null, d));
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/svg+xml');
    expect(res.body).toContain('<svg');
    expect((await request(app).get('/assets/packs/cat-moods/tray.svg')).status).toBe(200);
    expect((await request(app).get('/assets/decor/star-0.svg')).status).toBe(200);
    expect((await request(app).get('/assets/packs/cat-moods/zzz.svg')).status).toBe(404);
  });

  it('every pack has 3..30 stickers (WhatsApp limit)', async () => {
    const all = (await request(app).get('/api/packs?pageSize=50')).body.items;
    for (const p of all) {
      expect(p.stickerCount).toBeGreaterThanOrEqual(3);
      expect(p.stickerCount).toBeLessThanOrEqual(30);
    }
  });
});
