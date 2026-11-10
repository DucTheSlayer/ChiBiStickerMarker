/**
 * HTTP client mỏng. Trên web dev dùng proxy của Vite (base rỗng).
 * Trên app native (Capacitor) phải đặt VITE_API_BASE=https://api.your-domain.com khi build.
 */
const BASE: string = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function assetUrl(path: string): string {
  return /^https?:/.test(path) ? path : `${BASE}${path}`;
}

export async function getJson<T>(path: string, opts: { timeoutMs?: number; signal?: AbortSignal } = {}): Promise<T> {
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
