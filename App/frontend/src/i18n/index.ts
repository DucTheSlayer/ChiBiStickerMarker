import { computed, ref } from 'vue';
import type { LangCode } from '@/types';

const en = {
  appName: 'Chibi Studio',
  home: 'Home', create: 'Create', collection: 'Collection', settings: 'Settings',
  search: 'Search packs…', all: 'All', loadMore: 'Load more', loading: 'Loading…', retry: 'Try again',
  offline: 'Cannot reach the server. Check your connection.',
  stickers: 'stickers', downloads: 'downloads', premium: 'Premium',
  addToCollection: 'Save to collection', addToWhatsApp: 'Add to WhatsApp', related: 'Related packs',
  unlock: 'Watch to unlock', unlockTitle: 'Unlock premium', unlockBody: 'Watch a short reward to unlock this for free.',
  watching: 'Watching…', unlocked: 'Unlocked!',
  onb1t: 'Make unlimited sticker packs', onb1d: 'Create, save and organize as many packs as you like.',
  onb2t: 'Smart cutout tools', onb2d: 'Remove backgrounds and fine-tune with the eraser.',
  onb3t: 'Fun text & decorations', onb3d: 'Add text, stars, hearts and speech bubbles.',
  onb4t: 'Easy export & share', onb4d: 'Send your packs straight to WhatsApp.',
  next: 'Next', start: 'Get started', chooseLanguage: 'Choose language', continue: 'Continue',
  pickPhoto: 'Pick a photo', removeBg: 'Remove BG', tolerance: 'Tolerance', eraser: 'Eraser', brush: 'Brush', move: 'Move',
  text: 'Text', stickerTab: 'Stickers', background: 'Background', layers: 'Layers', undo: 'Undo', redo: 'Redo',
  size: 'Size', rotate: 'Rotate', color: 'Color', outline: 'Outline', done: 'Done', save: 'Save', cancel: 'Cancel', delete: 'Delete',
  duplicate: 'Duplicate', front: 'Forward', back: 'Backward', addText: 'Add text', yourText: 'Your text',
  newPack: 'New pack', packName: 'Pack name', addSticker: 'Add sticker', emptyCollection: 'No packs yet. Create your first sticker!',
  chooseTarget: 'Save to…', stepsTitle: 'How to use in WhatsApp',
  step1: 'Open WhatsApp and tap the sticker icon', step2: 'Choose your exported pack', step3: 'Tap any sticker to send it!',
  needThree: 'A pack needs at least 3 stickers to export.', waMissing: 'WhatsApp is not installed.',
  waDownloaded: 'Stickers downloaded (web preview).', waStarted: 'Opening WhatsApp…',
  language: 'Language', privacy: 'Privacy policy', about: 'About', version: 'Version',
  updateRequired: 'Please update the app to continue.', rename: 'Rename', exportFailed: 'Export failed.',
  saved: 'Saved!', discard: 'Discard changes?', discardBody: 'Your edits will be lost.',
} as const;

export type Messages = { [K in keyof typeof en]: string };
const vi: Messages = {
  appName: 'Chibi Studio',
  home: 'Trang chủ', create: 'Tạo', collection: 'Bộ sưu tập', settings: 'Cài đặt',
  search: 'Tìm bộ sticker…', all: 'Tất cả', loadMore: 'Xem thêm', loading: 'Đang tải…', retry: 'Thử lại',
  offline: 'Không kết nối được máy chủ. Kiểm tra mạng.',
  stickers: 'sticker', downloads: 'lượt tải', premium: 'Cao cấp',
  addToCollection: 'Lưu vào bộ sưu tập', addToWhatsApp: 'Thêm vào WhatsApp', related: 'Bộ liên quan',
  unlock: 'Xem quảng cáo để mở khoá', unlockTitle: 'Mở khoá nội dung cao cấp', unlockBody: 'Xem một đoạn ngắn để mở khoá miễn phí.',
  watching: 'Đang xem…', unlocked: 'Đã mở khoá!',
  onb1t: 'Tạo bộ sticker không giới hạn', onb1d: 'Tạo, lưu và sắp xếp bao nhiêu bộ tuỳ thích.',
  onb2t: 'Công cụ cắt ảnh thông minh', onb2d: 'Tách nền và tinh chỉnh bằng cục tẩy.',
  onb3t: 'Chữ & trang trí vui nhộn', onb3d: 'Thêm chữ, ngôi sao, trái tim, bong bóng thoại.',
  onb4t: 'Xuất & chia sẻ dễ dàng', onb4d: 'Gửi bộ sticker thẳng sang WhatsApp.',
  next: 'Tiếp', start: 'Bắt đầu', chooseLanguage: 'Chọn ngôn ngữ', continue: 'Tiếp tục',
  pickPhoto: 'Chọn ảnh', removeBg: 'Tách nền', tolerance: 'Độ nhạy', eraser: 'Tẩy', brush: 'Cọ', move: 'Di chuyển',
  text: 'Chữ', stickerTab: 'Sticker', background: 'Nền', layers: 'Lớp', undo: 'Hoàn tác', redo: 'Làm lại',
  size: 'Cỡ', rotate: 'Xoay', color: 'Màu', outline: 'Viền', done: 'Xong', save: 'Lưu', cancel: 'Huỷ', delete: 'Xoá',
  duplicate: 'Nhân bản', front: 'Lên trên', back: 'Xuống dưới', addText: 'Thêm chữ', yourText: 'Nội dung',
  newPack: 'Bộ mới', packName: 'Tên bộ sticker', addSticker: 'Thêm sticker', emptyCollection: 'Chưa có bộ nào. Hãy tạo sticker đầu tiên!',
  chooseTarget: 'Lưu vào…', stepsTitle: 'Cách dùng trong WhatsApp',
  step1: 'Mở WhatsApp, bấm biểu tượng sticker', step2: 'Chọn bộ sticker đã xuất', step3: 'Chạm vào sticker để gửi!',
  needThree: 'Cần tối thiểu 3 sticker để xuất.', waMissing: 'Chưa cài WhatsApp.',
  waDownloaded: 'Đã tải sticker về (bản web).', waStarted: 'Đang mở WhatsApp…',
  language: 'Ngôn ngữ', privacy: 'Chính sách bảo mật', about: 'Giới thiệu', version: 'Phiên bản',
  updateRequired: 'Vui lòng cập nhật ứng dụng để tiếp tục.', rename: 'Đổi tên', exportFailed: 'Xuất thất bại.',
  saved: 'Đã lưu!', discard: 'Bỏ thay đổi?', discardBody: 'Các chỉnh sửa sẽ mất.',
};

const dict: Record<LangCode, Messages> = { en, vi };
export const lang = ref<LangCode>('en');

export function setLang(l: LangCode) { lang.value = l; document.documentElement.lang = l; }

export function useI18n() {
  const messages = computed(() => dict[lang.value]);
  const t = (key: keyof Messages): string => messages.value[key];
  return { t, lang };
}

export function detectLang(): LangCode {
  return navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

export const LANGUAGES: { code: LangCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];
