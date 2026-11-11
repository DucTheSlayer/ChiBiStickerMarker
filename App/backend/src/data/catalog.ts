import { EMOTIONS, type Emotion, type Palette, type Species } from './art.js';
import { FLUENT_PACKS } from './fluent-packs.js';

export interface Category { id: string; name: { en: string; vi: string }; emoji: string }

export const CATEGORIES: Category[] = [
  { id: 'animals', name: { en: 'Animals', vi: 'Động vật' }, emoji: '🐾' },
  { id: 'emotions', name: { en: 'Emotions', vi: 'Cảm xúc' }, emoji: '😊' },
  { id: 'love', name: { en: 'Love', vi: 'Tình yêu' }, emoji: '💖' },
  { id: 'funny', name: { en: 'Funny', vi: 'Hài hước' }, emoji: '🤪' },
  { id: 'daily', name: { en: 'Daily', vi: 'Hằng ngày' }, emoji: '☀️' },
  { id: 'food', name: { en: 'Food', vi: 'Đồ ăn' }, emoji: '🍔' },
  { id: 'party', name: { en: 'Party', vi: 'Lễ hội' }, emoji: '🎉' },
];

export interface PackDef {
  kind: 'chibi';
  id: string;
  name: string;
  publisher: string;
  categoryId: string;
  species: Species;
  palette: Palette;
  emotions: Emotion[];
  premium: boolean;
  downloads: number;
}

const PUBLISHER = 'Chibi Studio';

const SPECIES_PALETTES: Record<Species, Palette[]> = {
  cat: [
    { body: '#ffd9a8', shade: '#e8a96b', accent: '#ff9a62', cheek: '#ff9fb2' },
    { body: '#d7d7e8', shade: '#8f8fb0', accent: '#9aa0ff', cheek: '#ffb3c7' },
  ],
  bunny: [
    { body: '#fff0f5', shade: '#e6b8cc', accent: '#ff9acb', cheek: '#ffb3c7' },
    { body: '#e9f6ff', shade: '#a9cde8', accent: '#7fbfff', cheek: '#ffc2d1' },
  ],
  bear: [
    { body: '#d9a97a', shade: '#a8774a', accent: '#8b5a2b', cheek: '#f4b8a0' },
    { body: '#f3e4d0', shade: '#cdb38f', accent: '#b48b5e', cheek: '#ffb7b7' },
  ],
  frog: [
    { body: '#b9ec9a', shade: '#7ec25f', accent: '#5aa63f', cheek: '#ffb3b3' },
    { body: '#9fe3d0', shade: '#5cbba3', accent: '#3a9e86', cheek: '#ffc2c2' },
  ],
  ghost: [
    { body: '#ffffff', shade: '#cfd6ff', accent: '#b9a6ff', cheek: '#ffb3d1' },
    { body: '#f3e9ff', shade: '#cdb8f5', accent: '#a48be8', cheek: '#ffb0cf' },
  ],
  chick: [
    { body: '#ffe66d', shade: '#f2c230', accent: '#ff9f43', cheek: '#ff9f9f' },
    { body: '#fff3a8', shade: '#f0d45c', accent: '#ffa24a', cheek: '#ffa8a8' },
  ],
};

const SPECIES_LIST: Species[] = ['cat', 'bunny', 'bear', 'frog', 'ghost', 'chick'];
const SPECIES_NAME: Record<Species, string> = {
  cat: 'Neko', bunny: 'Bunny', bear: 'Teddy', frog: 'Froggy', ghost: 'Boo', chick: 'Piyo',
};

interface Theme { suffix: string; categoryId: string; emotions: Emotion[]; premium: boolean }

const THEMES: Theme[] = [
  { suffix: 'Moods', categoryId: 'emotions', emotions: ['happy', 'sad', 'angry', 'surprised', 'sleepy', 'cry', 'laugh', 'shy'], premium: false },
  { suffix: 'Love Notes', categoryId: 'love', emotions: ['love', 'shy', 'wink', 'happy', 'cry', 'smirk'], premium: false },
  { suffix: 'LOL Club', categoryId: 'funny', emotions: ['laugh', 'wink', 'cool', 'smirk', 'surprised', 'angry', 'cry', 'happy'], premium: true },
  { suffix: 'Everyday', categoryId: 'daily', emotions: ['happy', 'sleepy', 'cool', 'wink', 'laugh', 'sad', 'love', 'surprised', 'shy', 'smirk'], premium: false },
];

function build(): PackDef[] {
  const packs: PackDef[] = [];
  let n = 0;
  SPECIES_LIST.forEach((species) => {
    THEMES.forEach((theme, ti) => {
      const palettes = SPECIES_PALETTES[species];
      const palette = palettes[(ti + n) % palettes.length]!;
      n += 1;
      packs.push({
        kind: 'chibi',
        id: `${species}-${theme.suffix.toLowerCase().replace(/\s+/g, '-')}`,
        name: `${SPECIES_NAME[species]} ${theme.suffix}`,
        publisher: PUBLISHER,
        categoryId: theme.categoryId,
        species,
        palette,
        emotions: theme.emotions,
        premium: theme.premium,
        downloads: 1200 + ((n * 7919) % 48000),
      });
    });
    // Mỗi loài thêm một pack "animals" đủ 12 cảm xúc.
    packs.push({
      kind: 'chibi',
      id: `${species}-all-stars`,
      name: `${SPECIES_NAME[species]} All-Stars`,
      publisher: PUBLISHER,
      categoryId: 'animals',
      species,
      palette: SPECIES_PALETTES[species][0]!,
      emotions: EMOTIONS.map((e) => e.id),
      premium: false,
      downloads: 3000 + ((n * 104729) % 60000),
    });
  });
  return packs;
}

export const PACKS: PackDef[] = build();

/** Bộ sticker từ Microsoft Fluent Emoji (MIT). */
export interface FluentPack {
  kind: 'fluent';
  id: string;
  name: string;
  publisher: string;
  categoryId: string;
  premium: boolean;
  downloads: number;
  stickers: { id: string; emoji: string }[];
}

export const FLUENT_CATALOG: FluentPack[] = FLUENT_PACKS.map((p, i) => ({
  kind: 'fluent',
  id: p.id,
  name: p.name,
  publisher: `${PUBLISHER} · Fluent Emoji`,
  categoryId: p.categoryId,
  premium: p.premium,
  downloads: 20000 + ((i * 7919 + 4513) % 60000),
  stickers: p.stickers.map(([icon, emoji]) => ({ id: icon, emoji })),
}));

export type CatalogPack = PackDef | FluentPack;

export const ALL_PACKS: CatalogPack[] = [...PACKS, ...FLUENT_CATALOG];

export const FONTS = [
  { id: 'comfortaa', family: 'Comfortaa', label: 'Comfortaa', premium: false },
  { id: 'fredoka', family: 'Fredoka', label: 'Fredoka', premium: false },
  { id: 'baloo', family: 'Baloo 2', label: 'Baloo', premium: false },
  { id: 'pacifico', family: 'Pacifico', label: 'Pacifico', premium: true },
  { id: 'bangers', family: 'Bangers', label: 'Bangers', premium: true },
  { id: 'gochi', family: 'Gochi Hand', label: 'Gochi Hand', premium: true },
];

export const REMOTE_CONFIG = {
  minVersion: '1.0.0',
  latestVersion: '1.0.0',
  adsEnabled: false,
  featureFlags: { removeBackground: true, brush: true, decorations: true, whatsappBusiness: true },
  languages: ['en', 'vi'],
};
