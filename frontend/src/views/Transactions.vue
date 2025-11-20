<template>
  <div class="transactions-page">
    <n-card>
      <template #header>
        <div class="card-header">
          <div>
            <h2>Transactions consolidées</h2>
            <p>Suivi des flux clients, ventes E-Cards et achats USDT</p>
          </div>
          <n-space>
            <n-date-picker v-model:value="dateRange" type="daterange" clearable @update:value="handleDateChange" />
            <n-button type="primary" :loading="loading" @click="loadTransactions">
              <template #icon>
                <n-icon :component="RefreshOutline" />
              </template>
              Actualiser
            </n-button>
          </n-space>
        </div>
      </template>

      <n-space :size="16">
        <n-statistic label="Total transactions clients" :value="clientsTotal" />
        <n-statistic label="Total ventes E-Cards" :value="ecardSalesTotal" />
        <n-statistic label="Total achats USDT" :value="usdtPurchasesTotal" />
      </n-space>

      <n-tabs type="segment" animated class="transactions-tabs">
        <n-tab-pane name="clients" tab="Transactions clients">
          <n-data-table :columns="clientColumns" :data="clientsTransactions" :loading="loading" />
        </n-tab-pane>
        <n-tab-pane name="ecard" tab="Ventes E-Cards">
          <n-data-table :columns="ecardColumns" :data="ecardSales" :loading="loading" />
        </n-tab-pane>
        <n-tab-pane name="usdt" tab="Achats USDT">
          <n-data-table :columns="usdtColumns" :data="usdtPurchases" :loading="loading" />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  NCard,
  NButton,
  NIcon,
  NDatePicker,
  NDataTable,
  NStatistic,
  NSpace,
  NTabs,
  NTabPane,
  useMessage,
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { RefreshOutline } from '@vicons/ionicons5';
import { cashCollectApi } from '@/api/cash-collect';
import { eCardsApi } from '@/api/e-cards';
import { usdtApi } from '@/api/usdt';

const message = useMessage();
const loading = ref(false);
const dateRange = ref<[number, number] | null>(null);

const clientsTransactions = ref<any[]>([]);
const ecardSales = ref<any[]>([]);
const usdtPurchases = ref<any[]>([]);

const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value || 0);

const defaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return [start.getTime(), end.getTime()] as [number, number];
};

const handleDateChange = (value: [number, number] | null) => {
  dateRange.value = value;
};

const loadTransactions = async () => {
  const range = dateRange.value || defaultRange();
  dateRange.value = range;
  const [start, end] = range;
  loading.value = true;
  try {
    const [clientsRes, ecardSalesRes, usdtPurchasesRes] = await Promise.all([
      cashCollectApi.transactions.getAll({
        startDate: new Date(start).toISOString(),
        endDate: new Date(end).toISOString(),
      }),
      eCardsApi.sales.getAll({
        startDate: new Date(start).toISOString(),
        endDate: new Date(end).toISOString(),
      }),
      usdtApi.purchases.getAll({
        startDate: new Date(start).toISOString(),
        endDate: new Date(end).toISOString(),
      }),
    ]);

    clientsTransactions.value = clientsRes.data || [];
    ecardSales.value = ecardSalesRes.data || [];
    usdtPurchases.value = usdtPurchasesRes.data || [];
  } catch (error) {
    message.error('Erreur lors du chargement des transactions');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  dateRange.value = defaultRange();
  loadTransactions();
});

const clientsTotal = computed(() =>
  clientsTransactions.value.reduce((sum, item) => sum + Number(item.amount || 0), 0),
);
const ecardSalesTotal = computed(() =>
  ecardSales.value.reduce((sum, item) => sum + Number(item.amount || 0), 0),
);
const usdtPurchasesTotal = computed(() =>
  usdtPurchases.value.reduce((sum, item) => sum + Number(item.amount || 0), 0),
);

const clientColumns: DataTableColumns = [
  {
    title: 'Agent',
    key: 'agent',
    render: (row: any) => row.agent?.name || '—',
  },
  { title: 'Type', key: 'type' },
  { title: 'Montant', key: 'amount', render: (row: any) => formatCurrency(row.amount, row.currency || 'USD') },
  { title: 'Devise', key: 'currency' },
  { title: 'Pays', key: 'country' },
  {
    title: 'Destination / Bénéficiaire',
    key: 'destination',
    render: (row: any) => row.destinationName || row.destination || '—',
  },
  {
    title: 'Date',
    key: 'transactionDate',
    render: (row: any) => new Date(row.transactionDate).toLocaleString(),
  },
];

const ecardColumns: DataTableColumns = [
  { title: 'Pays', key: 'country' },
  { title: 'Montant', key: 'amount', render: (row: any) => formatCurrency(row.amount, row.currency || 'USD') },
  { title: 'Devise', key: 'currency' },
  { title: 'Date de vente', key: 'saleDate', render: (row: any) => new Date(row.saleDate).toLocaleString() },
];

const usdtColumns: DataTableColumns = [
  {
    title: 'Fournisseur',
    key: 'supplier',
    render: (row: any) => row.supplier?.name || '—',
  },
  { title: 'Pays', key: 'country' },
  { title: 'Montant', key: 'amount', render: (row: any) => formatCurrency(row.amount, row.currency || 'USD') },
  { title: 'Taux', key: 'rate' },
  { title: 'Devise', key: 'currency' },
  { title: 'Date', key: 'createdAt', render: (row: any) => new Date(row.createdAt).toLocaleString() },
];
</script>

<style scoped>
.transactions-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.card-header h2 {
  margin: 0;
}

.card-header p {
  margin: 4px 0 0;
  color: #64748b;
}

.transactions-tabs {
  margin-top: 24px;
}
</style>

