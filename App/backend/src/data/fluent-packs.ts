/**
 * Các bộ sticker dựng từ Microsoft Fluent Emoji (giấy phép MIT).
 * Nguồn: https://github.com/microsoft/fluentui-emoji – xem THIRD_PARTY_NOTICES.md.
 *
 * Mỗi sticker là [tên icon trong bộ Iconify `fluent-emoji`, emoji Unicode tương ứng].
 * Sau khi sửa danh sách, chạy `npm run fluent:fetch` để cập nhật `fluent-emoji.json`.
 */
export interface FluentPackDef {
  id: string;
  name: string;
  categoryId: string;
  premium: boolean;
  stickers: [icon: string, emoji: string][];
}

export const FLUENT_PACKS: FluentPackDef[] = [
  {
    id: 'fluent-good-vibes',
    name: 'Good Vibes',
    categoryId: 'emotions',
    premium: false,
    stickers: [
      ['grinning-face', '😀'], ['beaming-face-with-smiling-eyes', '😁'], ['face-with-tears-of-joy', '😂'],
      ['grinning-squinting-face', '😆'], ['smiling-face-with-smiling-eyes', '😊'], ['winking-face', '😉'],
      ['smiling-face-with-sunglasses', '😎'], ['partying-face', '🥳'], ['zany-face', '🤪'],
      ['star-struck', '🤩'], ['upside-down-face', '🙃'], ['smiling-face-with-halo', '😇'],
      ['hugging-face', '🤗'], ['face-savoring-food', '😋'], ['nerd-face', '🤓'], ['melting-face', '🫠'],
    ],
  },
  {
    id: 'fluent-bad-day',
    name: 'Bad Day',
    categoryId: 'emotions',
    premium: false,
    stickers: [
      ['loudly-crying-face', '😭'], ['crying-face', '😢'], ['pleading-face', '🥺'], ['face-holding-back-tears', '🥹'],
      ['pensive-face', '😔'], ['weary-face', '😩'], ['tired-face', '😫'], ['angry-face', '😠'],
      ['pouting-face', '😡'], ['face-with-steam-from-nose', '😤'], ['face-with-symbols-on-mouth', '🤬'],
      ['face-screaming-in-fear', '😱'], ['face-with-spiral-eyes', '😵‍💫'], ['face-with-rolling-eyes', '🙄'],
      ['unamused-face', '😒'], ['sleeping-face', '😴'], ['yawning-face', '🥱'], ['face-exhaling', '😮‍💨'],
    ],
  },
  {
    id: 'fluent-love-mood',
    name: 'Love Mood',
    categoryId: 'love',
    premium: false,
    stickers: [
      ['smiling-face-with-heart-eyes', '😍'], ['smiling-face-with-hearts', '🥰'], ['face-blowing-a-kiss', '😘'],
      ['kissing-face-with-closed-eyes', '😚'], ['smiling-cat-with-heart-eyes', '😻'], ['red-heart', '❤️'],
      ['sparkling-heart', '💖'], ['two-hearts', '💕'], ['heart-with-arrow', '💘'], ['revolving-hearts', '💞'],
      ['heart-on-fire', '❤️‍🔥'], ['love-letter', '💌'], ['kiss-mark', '💋'], ['rose', '🌹'],
      ['bouquet', '💐'], ['teddy-bear', '🧸'],
    ],
  },
  {
    id: 'fluent-animal-friends',
    name: 'Animal Friends',
    categoryId: 'animals',
    premium: false,
    stickers: [
      ['cat-face', '🐱'], ['dog-face', '🐶'], ['rabbit-face', '🐰'], ['panda', '🐼'], ['fox', '🦊'],
      ['bear', '🐻'], ['koala', '🐨'], ['tiger-face', '🐯'], ['monkey-face', '🐵'], ['frog', '🐸'],
      ['penguin', '🐧'], ['hatching-chick', '🐣'], ['unicorn', '🦄'], ['pig-face', '🐷'], ['hamster', '🐹'],
      ['otter', '🦦'], ['sloth', '🦥'], ['hedgehog', '🦔'], ['t-rex', '🦖'], ['octopus', '🐙'],
    ],
  },
  {
    id: 'fluent-cat-mood',
    name: 'Meow Mood',
    categoryId: 'animals',
    premium: true,
    stickers: [
      ['grinning-cat', '😺'], ['grinning-cat-with-smiling-eyes', '😸'], ['cat-with-tears-of-joy', '😹'],
      ['smiling-cat-with-heart-eyes', '😻'], ['cat-with-wry-smile', '😼'], ['kissing-cat', '😽'],
      ['weary-cat', '🙀'], ['crying-cat', '😿'], ['pouting-cat', '😾'], ['see-no-evil-monkey', '🙈'],
      ['hear-no-evil-monkey', '🙉'], ['speak-no-evil-monkey', '🙊'],
    ],
  },
  {
    id: 'fluent-yummy',
    name: 'Yummy Time',
    categoryId: 'food',
    premium: false,
    stickers: [
      ['bubble-tea', '🧋'], ['pizza', '🍕'], ['hamburger', '🍔'], ['french-fries', '🍟'], ['steaming-bowl', '🍜'],
      ['sushi', '🍣'], ['rice-ball', '🍙'], ['dumpling', '🥟'], ['doughnut', '🍩'], ['shortcake', '🍰'],
      ['ice-cream', '🍨'], ['soft-ice-cream', '🍦'], ['cookie', '🍪'], ['hot-beverage', '☕'],
      ['strawberry', '🍓'], ['watermelon', '🍉'], ['avocado', '🥑'], ['popcorn', '🍿'], ['taco', '🌮'],
    ],
  },
  {
    id: 'fluent-hand-signs',
    name: 'Hand Signs',
    categoryId: 'daily',
    premium: false,
    stickers: [
      ['thumbs-up', '👍'], ['thumbs-down', '👎'], ['waving-hand', '👋'], ['ok-hand', '👌'], ['clapping-hands', '👏'],
      ['folded-hands', '🙏'], ['victory-hand', '✌️'], ['hand-with-index-finger-and-thumb-crossed', '🫰'],
      ['heart-hands', '🫶'], ['raising-hands', '🙌'], ['flexed-biceps', '💪'], ['call-me-hand', '🤙'],
      ['love-you-gesture', '🤟'], ['pinched-fingers', '🤌'], ['handshake', '🤝'], ['writing-hand', '✍️'],
    ],
  },
  {
    id: 'fluent-party-time',
    name: 'Party Time',
    categoryId: 'party',
    premium: false,
    stickers: [
      ['party-popper', '🎉'], ['confetti-ball', '🎊'], ['balloon', '🎈'], ['wrapped-gift', '🎁'],
      ['birthday-cake', '🎂'], ['sparkles', '✨'], ['fireworks', '🎆'], ['clinking-glasses', '🥂'],
      ['trophy', '🏆'], ['crown', '👑'], ['glowing-star', '🌟'], ['ribbon', '🎀'], ['mirror-ball', '🪩'],
      ['red-envelope', '🧧'], ['christmas-tree', '🎄'], ['jack-o-lantern', '🎃'],
    ],
  },
  {
    id: 'fluent-chaos-club',
    name: 'Chaos Club',
    categoryId: 'funny',
    premium: true,
    stickers: [
      ['clown-face', '🤡'], ['ghost', '👻'], ['skull', '💀'], ['pile-of-poo', '💩'], ['alien', '👽'],
      ['robot', '🤖'], ['face-with-monocle', '🧐'], ['thinking-face', '🤔'], ['shushing-face', '🤫'],
      ['face-with-peeking-eye', '🫣'], ['lying-face', '🤥'], ['money-mouth-face', '🤑'], ['cowboy-hat-face', '🤠'],
      ['disguised-face', '🥸'], ['fire', '🔥'], ['hundred-points', '💯'], ['collision', '💥'], ['zzz', '💤'],
    ],
  },
];

/** Tất cả tên icon cần có trong `fluent-emoji.json`. */
export function fluentIconNames(): string[] {
  return [...new Set(FLUENT_PACKS.flatMap((p) => p.stickers.map(([icon]) => icon)))].sort();
}
