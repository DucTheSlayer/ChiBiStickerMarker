import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

const backend = process.env.VITE_BACKEND_URL ?? 'http://localhost:4000';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 5173,
    proxy: { '/api': backend, '/assets/packs': backend, '/assets/decor': backend },
  },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
});
