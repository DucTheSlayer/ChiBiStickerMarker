import { defineStore } from 'pinia';
import { ref } from 'vue';
import { catalogApi } from '@/api/catalog.api';
import { detectLang, setLang } from '@/i18n';
import { kv } from '@/services/kv';
import type { LangCode, RemoteConfig } from '@/types';

export const APP_VERSION = '1.0.0';

const DEFAULT_CONFIG: RemoteConfig = {
  minVersion: '0.0.0', latestVersion: APP_VERSION, adsEnabled: false,
  featureFlags: { removeBackground: true, brush: true, decorations: true, whatsappBusiness: true },
  languages: ['en', 'vi'],
};

export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d < 0 ? -1 : 1;
  }
  return 0;
}

export const useAppStore = defineStore('app', () => {
  const config = ref<RemoteConfig>(DEFAULT_CONFIG);
  const language = ref<LangCode>('en');
  const onboarded = ref(false);
  const languageChosen = ref(false);
  const needsUpdate = ref(false);
  const ready = ref(false);

  /** Splash: đọc cài đặt cục bộ + remote config (timeout, có fallback). */
  async function init() {
    const saved = await kv.get<{ language?: LangCode; onboarded?: boolean; languageChosen?: boolean }>('settings', {});
    language.value = saved.language ?? detectLang();
    onboarded.value = !!saved.onboarded;
    languageChosen.value = !!saved.languageChosen;
    setLang(language.value);
    try {
      config.value = await catalogApi.config();
    } catch {
      config.value = DEFAULT_CONFIG;
    }
    needsUpdate.value = compareVersions(APP_VERSION, config.value.minVersion) < 0;
    ready.value = true;
  }

  async function persist() {
    await kv.set('settings', { language: language.value, onboarded: onboarded.value, languageChosen: languageChosen.value });
  }

  async function chooseLanguage(l: LangCode) {
    language.value = l;
    languageChosen.value = true;
    setLang(l);
    await persist();
  }

  async function finishOnboarding() {
    onboarded.value = true;
    await persist();
  }

  return { config, language, onboarded, languageChosen, needsUpdate, ready, init, chooseLanguage, finishOnboarding };
});
