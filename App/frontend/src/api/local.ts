/**
 * "Backend" chạy ngay trong app: gọi thẳng tầng service của App/backend (cùng một mã nguồn
 * với server Express), không cần mạng. Ánh xạ đúng các route của backend/src/routes/api.ts
 * và backend/src/routes/assets.ts để UI không phải biết đang chạy local hay remote.
 */
import * as catalog from '@backend/services/catalog.service';

export class LocalApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

function intParam(raw: string | null, name: string, def: number, min: number, max: number): number {
  if (raw === null) return def;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new LocalApiError(400, 'BAD_QUERY', `${name} must be an integer between ${min} and ${max}`);
  }
  return n;
}

/** Tương đương GET /api/... của server. */
export function localGet(path: string): unknown {
  const url = new URL(path, 'http://local');
  const p = url.pathname;
  const qs = url.searchParams;
  if (p === '/api/health') return { ok: true, version: '1.0.0' };
  if (p === '/api/config') return catalog.getConfig();
  if (p === '/api/categories') return catalog.getCategories();
  if (p === '/api/fonts') return catalog.getFonts();
  if (p === '/api/decorations') return catalog.getDecorations();
  if (p === '/api/packs') {
    return catalog.listPacks({
      page: intParam(qs.get('page'), 'page', 1, 1, 10_000),
      pageSize: intParam(qs.get('pageSize'), 'pageSize', 12, 1, 50),
      category: qs.get('category') || undefined,
      q: qs.get('q') ?? undefined,
    });
  }
  const m = /^\/api\/packs\/([^/]+)$/.exec(p);
  if (m) {
    const id = decodeURIComponent(m[1]!);
    const pack = catalog.getPack(id);
    if (!pack) throw new LocalApiError(404, 'PACK_NOT_FOUND', `Pack "${id}" not found`);
    return pack;
  }
  throw new LocalApiError(404, 'NOT_FOUND', 'Route not found');
}

const urlCache = new Map<string, string>();

/** Tương đương /assets/...svg của server → data: URL (dùng được cho <img>, fetch và canvas). */
export function localAssetUrl(path: string): string | undefined {
  const hit = urlCache.get(path);
  if (hit) return hit;
  let svg: string | undefined;
  const sticker = /^\/assets\/packs\/([^/]+)\/([^/]+)\.svg$/.exec(path);
  const decor = /^\/assets\/decor\/([^/]+)\.svg$/.exec(path);
  if (sticker) svg = catalog.renderSticker(decodeURIComponent(sticker[1]!), decodeURIComponent(sticker[2]!));
  else if (decor) svg = catalog.renderDecor(decodeURIComponent(decor[1]!));
  if (!svg) return undefined;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  urlCache.set(path, url);
  return url;
}
