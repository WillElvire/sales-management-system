<template>
  <div class="layout-shell">
    <div class="neon-background" />
    <div class="grid-overlay" />
    <n-layout has-sider class="glass-layout">
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
        class="glass-sider"
      >
        <div class="sider-brand">
          <div class="brand-badge">SMP</div>
          <div>
            <strong>Sales Management</strong>
            <span>Monitoring Suite</span>
          </div>
        </div>
        <n-menu
          v-model:value="activeKey"
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          @update:value="handleMenuSelect"
          class="glass-menu"
        />
      </n-layout-sider>
      <n-layout class="glass-main">
        <n-layout-header class="glass-header">
          <div class="header-content">
            <div class="header-meta">
              <h2>Sales Management Platform</h2>
              <p>Vue consolidée des flux Head Office / Comptable / Collect</p>
            </div>
            <n-dropdown :options="userOptions" @select="handleUserSelect">
              <n-button quaternary class="user-button">
                <template #icon>
                  <n-icon><PersonCircleOutline /></n-icon>
                </template>
                {{ authStore.user?.username }}
              </n-button>
            </n-dropdown>
          </div>
        </n-layout-header>
        <n-layout-content class="glass-content">
          <router-view />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NButton,
  NIcon,
  NDropdown,
} from 'naive-ui';
import {
  HomeOutline,
  PeopleOutline,
  CardOutline,
  WalletOutline,
  CashOutline,
  DocumentTextOutline,
  PersonCircleOutline,
  LogOutOutline,
  SwapHorizontal,
  GlobeOutline,
  PersonAddOutline,
} from '@vicons/ionicons5';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const collapsed = ref(false);
const activeKey = ref(route.name as string);

const menuOptions = computed(() => {
  const base = [
    {
      label: 'Dashboard',
      key: 'Dashboard',
      icon: () => h(NIcon, null, { default: () => h(HomeOutline) }),
    },
  ];

  if (authStore.hasRole('Admin') || authStore.hasRole('Comptable')) {
    base.push({
      label: 'Utilisateurs',
      key: 'Users',
      icon: () => h(NIcon, null, { default: () => h(PeopleOutline) }),
    });
    base.push({
      label: 'Pays',
      key: 'Countries',
      icon: () => h(NIcon, null, { default: () => h(GlobeOutline) }),
    });
    base.push({
      label: 'Clients',
      key: 'Clients',
      icon: () => h(NIcon, null, { default: () => h(PersonAddOutline) }),
    });
  }

  base.push(
    {
      label: 'E-Cards',
      key: 'ECards',
      icon: () => h(NIcon, null, { default: () => h(CardOutline) }),
    },
    {
      label: 'USDT',
      key: 'USDT',
      icon: () => h(NIcon, null, { default: () => h(WalletOutline) }),
    },
    {
      label: 'Cash Collect',
      key: 'CashCollect',
      icon: () => h(NIcon, null, { default: () => h(CashOutline) }),
    },
    {
      label: 'Transactions',
      key: 'Transactions',
      icon: () => h(NIcon, null, { default: () => h(SwapHorizontal) }),
    },
    {
      label: 'Rapports',
      key: 'Reports',
      icon: () => h(NIcon, null, { default: () => h(DocumentTextOutline) }),
    },
  );

  return base;
});

const userOptions = [
  {
    label: 'Déconnexion',
    key: 'logout',
    icon: () => h(NIcon, null, { default: () => h(LogOutOutline) }),
  },
];

const handleMenuSelect = (key: string) => {
  router.push({ name: key });
};

const handleUserSelect = (key: string) => {
  if (key === 'logout') {
    authStore.logout();
    router.push('/login');
  }
};
</script>

<style scoped>
.layout-shell {
  position: relative;
  min-height: 100vh;
  background: #f8fbf9;
  color: #0f172a;
}

.neon-background,
.grid-overlay {
  display: none;
}

.glass-layout {
  background: transparent;
  min-height: 100vh;
}

.glass-sider {
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.9);
  border-right: 1px solid rgba(16, 185, 129, 0.15);
  color: #0f172a;
  padding-top: 16px;
}

.sider-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 12px;
}

.brand-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f5132, #22c55e);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.sider-brand strong {
  display: block;
  font-size: 14px;
}

.sider-brand span {
  font-size: 11px;
  opacity: 0.7;
}

.glass-menu :deep(.n-menu-item) {
  color: rgba(15, 23, 42, 0.7);
}

.glass-menu :deep(.n-menu-item.n-menu-item--selected) {
  background: rgba(16, 185, 129, 0.12);
  color: #0f5132;
}

.glass-main {
  background: transparent;
}

.glass-header {
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(16, 185, 129, 0.12);
  height: 88px;
  display: flex;
  align-items: center;
  padding: 0 32px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-meta h2 {
  margin: 0;
  color: #0f172a;
}

.header-meta p {
  margin: 2px 0 0;
  color: rgba(15, 23, 42, 0.65);
  font-size: 13px;
}

.user-button {
  border-radius: 999px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #0f5132;
}

.glass-content {
  padding: 24px;
  min-height: calc(100vh - 88px);
  background: transparent;
}

@media (max-width: 768px) {
  .glass-header {
    height: auto;
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

