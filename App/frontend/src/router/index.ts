import { createRouter, createWebHashHistory } from 'vue-router';
import { useAppStore } from '@/stores/app';

export const router = createRouter({
  history: createWebHashHistory(), // hash mode: chạy được trong WebView Capacitor không cần cấu hình server
  routes: [
    { path: '/', name: 'splash', component: () => import('@/views/SplashView.vue') },
    { path: '/language', name: 'language', component: () => import('@/views/LanguageView.vue') },
    { path: '/onboarding', name: 'onboarding', component: () => import('@/views/OnboardingView.vue') },
    {
      path: '/',
      component: () => import('@/components/MainLayout.vue'),
      children: [
        { path: 'home', name: 'home', component: () => import('@/views/HomeView.vue') },
        { path: 'collection', name: 'collection', component: () => import('@/views/CollectionView.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
      ],
    },
    { path: '/pack/:id', name: 'pack', component: () => import('@/views/PackDetailView.vue'), props: true },
    { path: '/collection/:id', name: 'collection-detail', component: () => import('@/views/CollectionDetailView.vue'), props: true },
    { path: '/editor', name: 'editor', component: () => import('@/views/EditorView.vue'), props: (r) => ({ packId: r.query.pack as string | undefined }) },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

// Mọi route (trừ splash) cần app đã khởi tạo (settings, collection, unlock): nếu chưa, qua Splash trước rồi quay lại.
router.beforeEach((to) => {
  const app = useAppStore();
  if (!app.ready && to.name !== 'splash') return { name: 'splash', query: { redirect: to.fullPath } };
  return true;
});
