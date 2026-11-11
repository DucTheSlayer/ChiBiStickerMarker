import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chibistudio.app',
  appName: 'Chibi Studio',
  webDir: 'dist',
  android: { allowMixedContent: false },
  // Dev build: WebView chạy http://localhost + gọi API http qua `adb reverse`. Bỏ 2 dòng này khi phát hành.
  server: { androidScheme: 'http', cleartext: true },
};

export default config;
