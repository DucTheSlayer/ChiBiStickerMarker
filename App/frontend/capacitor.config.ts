import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chibistudio.app',
  appName: 'Chibi Studio',
  webDir: 'dist',
  android: { allowMixedContent: false },
};

export default config;
