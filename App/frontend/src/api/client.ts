/**
 * Client catalog, có 2 nguồn dữ liệu:
 *  - "local" (mặc định): chạy tầng service của App/backend ngay trong app (src/api/local.ts),
 *    không cần server, chạy được offline trên điện thoại.
 *  - "remote": gọi server Express qua HTTP. Bật bằng VITE_CATALOG_SOURCE=remote.
 *    Trên web dev dùng proxy của Vite (base rỗng); trên app native đặt VITE_API_BASE=https://api.your-domain.com.
 */
type LocalModule = typeof import('./local');

export const CATALOG_SOURCE: 'local' | 'remote' =
  import.meta.env.VITE_CATALOG_SOURCE === 'remote' ? 'remote' : 'local';

const BASE: string = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

// Tải lười để dữ liệu sticker (~2MB) nằm ở chunk riêng, không làm chậm lúc mở app.
let local: LocalModule | undefined;
let localLoading: Promise<LocalModule> | undefined;
function loadLocal(): Promise<LocalModule> {
  localLoading ??= import('./local').then((m) => (local = m));
  return localLoading;
}

/**
 * Đổi đường dẫn asset (/assets/...) mà API trả về thành URL hiển thị được.
 * Ở chế độ local, URL asset chỉ đến từ kết quả API nên module local luôn đã được tải.
 */
export function assetUrl(path: string): string {
  if (/^(https?|data|blob):/.test(path)) return path;
  if (CATALOG_SOURCE === 'local') return local?.localAssetUrl(path) ?? path;
  return `${BASE}${path}`;
}

async function getLocal<T>(path: string): Promise<T> {
  const m = await loadLocal();
  try {
    // Sao chép sâu để UI không vô tình sửa dữ liệu dùng chung của catalog.
    return structuredClone(m.localGet(path)) as T;
  } catch (e) {
    if (e instanceof m.LocalApiError) throw new HttpError(e.status, e.code, e.message);
    throw e;
  }
}

export async function getJson<T>(path: string, opts: { timeoutMs?: number; signal?: AbortSignal } = {}): Promise<T> {
  if (CATALOG_SOURCE === 'local') return getLocal<T>(path);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 8000);
  opts.signal?.addEventListener('abort', () => ctrl.abort());
  try {
    const res = await fetch(`${BASE}${path}`, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) {
      let code = 'HTTP_ERROR';
      let message = res.statusText;
      try {
        const body = (await res.json()) as { error?: { code: string; message: string } };
        if (body.error) ({ code, message } = body.error);
      } catch { /* body không phải JSON */ }
      throw new HttpError(res.status, code, message);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
