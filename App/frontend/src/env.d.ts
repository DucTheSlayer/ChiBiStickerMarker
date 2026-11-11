/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

interface ImportMetaEnv {
  /** "local" (mặc định): catalog chạy trong app; "remote": gọi server Express. */
  readonly VITE_CATALOG_SOURCE?: 'local' | 'remote';
  readonly VITE_API_BASE?: string;
}
