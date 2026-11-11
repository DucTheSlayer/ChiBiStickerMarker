/** Nền pastel cho thẻ gói sticker: ổn định theo id để một gói luôn cùng màu ở mọi màn hình. */
const TINTS = [
  'bg-candy-butter',
  'bg-candy-mint',
  'bg-candy-sky',
  'bg-candy-lilac',
  'bg-candy-peach',
  'bg-candy-rose',
] as const;

export function packTint(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length]!;
}

/** 61916 -> "61.9K" */
const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
export function compactNumber(n: number): string {
  return compact.format(n);
}
