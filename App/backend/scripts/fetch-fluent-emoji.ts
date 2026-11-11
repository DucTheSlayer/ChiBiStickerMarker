/**
 * Tải các Fluent Emoji (bản Color, MIT) mà FLUENT_PACKS cần từ Iconify API
 * và ghi ra src/data/fluent-emoji.json (đã commit, server không cần mạng khi chạy).
 *
 *   npm run fluent:fetch
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fluentIconNames } from '../src/data/fluent-packs.js';

interface IconifyIcon { body: string; width?: number; height?: number }
interface IconifyJson { prefix: string; icons: Record<string, IconifyIcon>; width?: number; height?: number; not_found?: string[] }

const API = 'https://api.iconify.design';
const OUT = fileURLToPath(new URL('../src/data/fluent-emoji.json', import.meta.url));

const names = fluentIconNames();
const icons: Record<string, { body: string; width: number; height: number }> = {};
const missing: string[] = [];

for (let i = 0; i < names.length; i += 40) {
  const chunk = names.slice(i, i + 40);
  const res = await fetch(`${API}/fluent-emoji.json?icons=${chunk.join(',')}`);
  if (!res.ok) throw new Error(`Iconify API ${res.status}`);
  const data = (await res.json()) as IconifyJson;
  missing.push(...(data.not_found ?? []));
  for (const [name, icon] of Object.entries(data.icons)) {
    icons[name] = { body: icon.body, width: icon.width ?? data.width ?? 16, height: icon.height ?? data.height ?? 16 };
  }
}

if (missing.length) {
  console.error('Không tìm thấy icon:', missing.join(', '));
  process.exit(1);
}

const sorted = Object.fromEntries(Object.keys(icons).sort().map((k) => [k, icons[k]!]));
writeFileSync(
  OUT,
  JSON.stringify({
    source: 'https://github.com/microsoft/fluentui-emoji',
    license: 'MIT – Copyright (c) Microsoft Corporation',
    icons: sorted,
  }),
);
console.log(`Đã ghi ${Object.keys(sorted).length} icon vào ${OUT}`);
