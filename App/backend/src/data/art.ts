/**
 * Bộ sinh sticker chibi gốc (SVG) – do dự án tự thiết kế, không dùng art của bên thứ ba.
 * Mọi hình đều là SVG 512x512, nền trong suốt.
 */
export type Emotion =
  | 'happy' | 'laugh' | 'love' | 'wink' | 'cool' | 'sleepy'
  | 'sad' | 'cry' | 'angry' | 'surprised' | 'shy' | 'smirk';

export type Species = 'cat' | 'bunny' | 'bear' | 'frog' | 'ghost' | 'chick';

export interface Palette { body: string; shade: string; accent: string; cheek: string }

export const EMOTIONS: { id: Emotion; emoji: string }[] = [
  { id: 'happy', emoji: '😊' }, { id: 'laugh', emoji: '😆' }, { id: 'love', emoji: '😍' },
  { id: 'wink', emoji: '😉' }, { id: 'cool', emoji: '😎' }, { id: 'sleepy', emoji: '😴' },
  { id: 'sad', emoji: '😢' }, { id: 'cry', emoji: '😭' }, { id: 'angry', emoji: '😠' },
  { id: 'surprised', emoji: '😮' }, { id: 'shy', emoji: '😳' }, { id: 'smirk', emoji: '😏' },
];

const INK = '#3a2a3f';

function ears(species: Species, p: Palette): string {
  switch (species) {
    case 'cat':
      return `<path d="M120 190 L150 70 L240 130 Z" fill="${p.body}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
<path d="M392 190 L362 70 L272 130 Z" fill="${p.body}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
<path d="M150 150 L160 100 L205 130 Z" fill="${p.cheek}"/><path d="M362 150 L352 100 L307 130 Z" fill="${p.cheek}"/>`;
    case 'bunny':
      return `<ellipse cx="190" cy="90" rx="42" ry="95" fill="${p.body}" stroke="${INK}" stroke-width="10"/>
<ellipse cx="322" cy="90" rx="42" ry="95" fill="${p.body}" stroke="${INK}" stroke-width="10"/>
<ellipse cx="190" cy="95" rx="18" ry="62" fill="${p.cheek}"/><ellipse cx="322" cy="95" rx="18" ry="62" fill="${p.cheek}"/>`;
    case 'bear':
      return `<circle cx="140" cy="150" r="52" fill="${p.body}" stroke="${INK}" stroke-width="10"/>
<circle cx="372" cy="150" r="52" fill="${p.body}" stroke="${INK}" stroke-width="10"/>
<circle cx="140" cy="150" r="24" fill="${p.cheek}"/><circle cx="372" cy="150" r="24" fill="${p.cheek}"/>`;
    case 'frog':
      return `<circle cx="165" cy="130" r="50" fill="${p.body}" stroke="${INK}" stroke-width="10"/>
<circle cx="347" cy="130" r="50" fill="${p.body}" stroke="${INK}" stroke-width="10"/>`;
    case 'chick':
      return `<path d="M256 62 q-10 40 6 62 q20 -28 6 -62 z" fill="${p.accent}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
    default:
      return '';
  }
}

function eyes(e: Emotion): string {
  const dot = (x: number) => `<ellipse cx="${x}" cy="270" rx="16" ry="22" fill="${INK}"/><circle cx="${x + 5}" cy="261" r="6" fill="#fff"/>`;
  const arc = (x: number) => `<path d="M${x - 24} 275 q24 -34 48 0" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>`;
  const line = (x: number) => `<path d="M${x - 24} 275 h48" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>`;
  const heart = (x: number) => `<path d="M${x} 296 c-34 -22 -34 -52 -10 -52 c8 0 10 6 10 10 c0 -4 2 -10 10 -10 c24 0 24 30 -10 52 z" fill="#ff5b8a" stroke="${INK}" stroke-width="5"/>`;
  const angry = (x: number, s: number) => `${dot(x)}<path d="M${x - 30 * s} 232 l${60 * s} 20" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>`;
  switch (e) {
    case 'laugh': return arc(190) + arc(322);
    case 'love': return heart(190) + heart(322);
    case 'wink': return dot(190) + `<path d="M298 278 q24 -26 48 0" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>`;
    case 'cool': return `<rect x="140" y="248" width="100" height="56" rx="18" fill="${INK}"/><rect x="272" y="248" width="100" height="56" rx="18" fill="${INK}"/><path d="M240 266 h32" stroke="${INK}" stroke-width="10"/>`;
    case 'sleepy': return line(190) + line(322) + `<text x="380" y="190" font-size="54" font-family="sans-serif" fill="${INK}">z</text>`;
    case 'sad': return dot(190) + dot(322) + `<path d="M160 240 l60 -14 M352 240 l-60 -14" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`;
    case 'cry': return dot(190) + dot(322) + `<path d="M180 300 q-14 50 0 70 q18 -20 0 -70 M332 300 q-14 50 0 70 q18 -20 0 -70" fill="#6ec6ff" stroke="${INK}" stroke-width="4"/>`;
    case 'angry': return angry(190, 1) + angry(322, -1);
    case 'surprised': return `<circle cx="190" cy="268" r="24" fill="#fff" stroke="${INK}" stroke-width="8"/><circle cx="190" cy="268" r="9" fill="${INK}"/><circle cx="322" cy="268" r="24" fill="#fff" stroke="${INK}" stroke-width="8"/><circle cx="322" cy="268" r="9" fill="${INK}"/>`;
    case 'shy': return `<path d="M165 280 q25 -26 50 0 M297 280 q25 -26 50 0" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>`;
    case 'smirk': return dot(190) + dot(322) + `<path d="M296 236 h52" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`;
    default: return dot(190) + dot(322);
  }
}

function mouth(e: Emotion, p: Palette): string {
  switch (e) {
    case 'laugh': return `<path d="M200 330 q56 70 112 0 z" fill="#8a1c3c" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><path d="M222 352 q34 22 68 0" fill="#ff7a9c"/>`;
    case 'love': case 'happy': case 'wink': return `<path d="M222 332 q34 36 68 0" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`;
    case 'cool': case 'smirk': return `<path d="M226 340 q40 18 66 -10" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`;
    case 'sleepy': return `<circle cx="256" cy="344" r="12" fill="${p.cheek}" stroke="${INK}" stroke-width="6"/>`;
    case 'sad': case 'cry': return `<path d="M222 358 q34 -34 68 0" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`;
    case 'angry': return `<path d="M224 356 h64" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`;
    case 'surprised': return `<ellipse cx="256" cy="350" rx="20" ry="26" fill="#8a1c3c" stroke="${INK}" stroke-width="8"/>`;
    case 'shy': return `<path d="M234 340 q22 14 44 0" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;
  }
}

function extras(species: Species, p: Palette): string {
  switch (species) {
    case 'cat':
      return `<path d="M110 300 h-60 M110 322 l-56 16 M402 300 h60 M402 322 l56 16" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    case 'chick':
      return `<path d="M236 312 l20 -12 l20 12 l-20 14 z" fill="${p.accent}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
    default:
      return '';
  }
}

export function stickerSvg(species: Species, emotion: Emotion, p: Palette): string {
  const ghost = species === 'ghost';
  const head = ghost
    ? `<path d="M96 260 a160 170 0 0 1 320 0 v170 q-26 -34 -53 0 q-27 34 -53 0 q-27 -34 -54 0 q-27 34 -53 0 q-27 -34 -53 0 q-27 34 -54 0 z" fill="${p.body}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>`
    : `<ellipse cx="256" cy="290" rx="170" ry="150" fill="${p.body}" stroke="${INK}" stroke-width="10"/>
<ellipse cx="256" cy="372" rx="110" ry="60" fill="${p.shade}" opacity=".35"/>`;
  const cheekOpacity = emotion === 'shy' ? 1 : 0.7;
  const cheeks = `<ellipse cx="140" cy="322" rx="30" ry="18" fill="${p.cheek}" opacity="${cheekOpacity}"/><ellipse cx="372" cy="322" rx="30" ry="18" fill="${p.cheek}" opacity="${cheekOpacity}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
${ears(species, p)}${head}${eyes(emotion)}${mouth(emotion, p)}${cheeks}${extras(species, p)}
</svg>`;
}

/* ---- Decoration (sticker trang trí) ---- */
export interface DecorDef { id: string; svg: string }

const star = (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 8 l12 28 30 3 -23 20 7 30 -26 -16 -26 16 7 -30 -23 -20 30 -3z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`;
const heartShape = (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 88 C10 58 10 24 32 22 c10 0 16 6 18 12 2-6 8-12 18-12 22 2 22 36-18 66z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`;
const flower = (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="50" cy="26" rx="14" ry="20" fill="${c}" stroke="${INK}" stroke-width="3" transform="rotate(${a} 50 50)"/>`).join('')}<circle cx="50" cy="50" r="11" fill="#ffd54a" stroke="${INK}" stroke-width="3"/></svg>`;
const sparkle = (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 6 Q54 46 94 50 Q54 54 50 94 Q46 54 6 50 Q46 46 50 6z" fill="${c}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`;
const bubble = (t: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><path d="M14 10 h132 a10 10 0 0 1 10 10 v44 a10 10 0 0 1 -10 10 h-70 l-22 20 v-20 h-40 a10 10 0 0 1 -10 -10 v-44 a10 10 0 0 1 10 -10z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><text x="80" y="54" font-family="sans-serif" font-weight="800" font-size="26" text-anchor="middle" fill="${INK}">${t}</text></svg>`;
const crown = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M12 76 L16 30 L36 52 L50 22 L64 52 L84 30 L88 76z" fill="#ffd54a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="60" r="6" fill="#ff5b8a"/></svg>`;

export const DECOR_GROUPS: { id: string; name: string; premium: boolean; items: DecorDef[] }[] = [
  { id: 'stars', name: 'Stars', premium: false, items: ['#ffd54a', '#ff9acb', '#8ee3ff', '#b6f28c'].map((c, i) => ({ id: `star-${i}`, svg: star(c) })) },
  { id: 'hearts', name: 'Hearts', premium: false, items: ['#ff5b8a', '#ffa3c4', '#c58bff', '#ff8a5b'].map((c, i) => ({ id: `heart-${i}`, svg: heartShape(c) })) },
  { id: 'flowers', name: 'Flowers', premium: false, items: ['#ff9acb', '#ffd1e3', '#b6e3ff', '#d9c2ff'].map((c, i) => ({ id: `flower-${i}`, svg: flower(c) })) },
  { id: 'sparkles', name: 'Sparkles', premium: true, items: [...['#fff3a0', '#bfe9ff', '#ffc7e6'].map((c, i) => ({ id: `sparkle-${i}`, svg: sparkle(c) })), { id: 'crown-0', svg: crown() }] },
  { id: 'bubbles', name: 'Speech', premium: true, items: ['OK!', 'LOL', 'Yay', 'Hi', 'No!', 'Love'].map((t, i) => ({ id: `bubble-${i}`, svg: bubble(t) })) },
];
