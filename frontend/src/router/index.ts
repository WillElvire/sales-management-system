import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { public: true },
    },
    {
      path: '/otp',
      name: 'OTP',
      component: () => import('@/views/OTP.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/Users.vue'),
          meta: { roles: ['Admin', 'Comptable'] },
        },
        {
          path: 'e-cards',
          name: 'ECards',
          component: () => import('@/views/ECards.vue'),
        },
        {
          path: 'usdt',
          name: 'USDT',
          component: () => import('@/views/USDT.vue'),
        },
        {
          path: 'cash-collect',
          name: 'CashCollect',
          component: () => import('@/views/CashCollect.vue'),
        },
        {
          path: 'reports',
          name: 'Reports',
          component: () => import('@/views/Reports.vue'),
        },
        {
          path: 'transactions',
          name: 'Transactions',
          component: () => import('@/views/Transactions.vue'),
          meta: { roles: ['Admin', 'Comptable'] },
        },
        {
          path: 'countries',
          name: 'Countries',
          component: () => import('@/views/Countries.vue'),
          meta: { roles: ['Admin', 'Comptable'] },
        },
        {
          path: 'clients',
          name: 'Clients',
          component: () => import('@/views/Clients.vue'),
          meta: { roles: ['Admin', 'Comptable'] },
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  try {
    await authStore.restoreSession();
  } catch (error) {
    if (!to.meta.public) {
      return next('/login');
    }
  }

  if (to.meta.public) {
    if (authStore.isAuthenticated()) {
      next('/');
    } else {
      next();
    }
  } else if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated()) {
      next('/login');
    } else if (to.meta.roles) {
      const hasRole = to.meta.roles.some((role: string) => authStore.hasRole(role));
      if (hasRole) {
        next();
      } else {
        next('/');
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;

