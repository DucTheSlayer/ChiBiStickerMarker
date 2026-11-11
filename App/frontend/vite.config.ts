import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { searchForWorkspaceRoot } from 'vite';
import { defineConfig } from 'vitest/config';

const backend = process.env.VITE_BACKEND_URL ?? 'http://localhost:4000';
// Tầng service của backend được UI import thẳng (chế độ catalog "local", xem src/api/client.ts).
const backendSrc = fileURLToPath(new URL('../backend/src', import.meta.url));

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)), '@backend': backendSrc } },
  server: {
    port: 5173,
    fs: { allow: [searchForWorkspaceRoot(process.cwd()), backendSrc] },
    proxy: { '/api': backend, '/assets/packs': backend, '/assets/decor': backend },
  },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
});
