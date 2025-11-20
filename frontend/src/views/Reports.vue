<template>
  <div class="reports-page">
    <n-card>
      <template #header>
        <n-space>
          <n-date-picker v-model:value="startDate" type="date" placeholder="Date de début" />
          <n-date-picker v-model:value="endDate" type="date" placeholder="Date de fin" />
          <n-button type="primary" @click="loadReports" :loading="loading">Charger</n-button>
        </n-space>
      </template>
      <n-tabs type="line" animated>
        <n-tab-pane name="e-cards" tab="E-Cards">
          <n-data-table :columns="eCardsColumns" :data="eCardsData" :loading="loading" />
        </n-tab-pane>
        <n-tab-pane name="usdt" tab="USDT">
          <n-data-table :columns="usdtColumns" :data="usdtData" :loading="loading" />
        </n-tab-pane>
        <n-tab-pane name="cash-collect" tab="Cash Collect">
          <n-data-table :columns="cashCollectColumns" :data="cashCollectData" :loading="loading" />
        </n-tab-pane>
        <n-tab-pane name="finance" tab="Finance">
          <n-data-table :columns="financeColumns" :data="financeData" :loading="loading" />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { reportsApi } from '@/api/reports';
import type { DataTableColumns } from 'naive-ui';

const message = useMessage();
const loading = ref(false);
const startDate = ref<number | null>(null);
const endDate = ref<number | null>(null);
const eCardsData = ref<any[]>([]);
const usdtData = ref<any[]>([]);
const cashCollectData = ref<any[]>([]);
const cashCollectTransactions = ref<any[]>([]);
const financeData = ref<{ type: string; amount: number }[]>([]);
const financeSummary = ref<Record<string, number>>({});

const eCardsColumns: DataTableColumns = [
  { title: 'Fournisseur', key: 'name' },
  { title: 'Solde', key: 'balance' },
  { title: 'Total Achats', key: 'totalPurchases' },
];

const usdtColumns: DataTableColumns = [
  { title: 'Fournisseur', key: 'name' },
  { title: 'Pays', key: 'country' },
  { title: 'Solde', key: 'balance' },
];

const cashCollectColumns: DataTableColumns = [
  { title: 'Agent', key: 'name' },
  { title: 'Pays', key: 'country' },
  { title: 'Solde', key: 'balance' },
];

const financeColumns: DataTableColumns = [
  { title: 'Type', key: 'type' },
  { title: 'Montant', key: 'amount' },
];

const loadReports = async () => {
  if (!startDate.value || !endDate.value) {
    message.warning('Veuillez sélectionner les dates');
    return;
  }

  loading.value = true;
  try {
    const start = new Date(startDate.value).toISOString();
    const end = new Date(endDate.value).toISOString();

    const [eCards, usdt, cashCollect, finance] = await Promise.all([
      reportsApi.eCards(start, end),
      reportsApi.usdt(start, end),
      reportsApi.cashCollect(start, end),
      reportsApi.finance(start, end),
    ]);

    eCardsData.value = eCards.data.suppliers || [];
    usdtData.value = usdt.data.suppliers || [];
    cashCollectData.value = cashCollect.data.agents || [];
    cashCollectTransactions.value = cashCollect.data.transactions || [];

    const summary = finance.data.summary || {};
    financeSummary.value = summary;
    financeData.value = [
      { type: 'Total Achats E-Cards', amount: summary.totalECardsPurchases || 0 },
      { type: 'Total Ventes E-Cards', amount: summary.totalECardsSales || 0 },
      { type: 'Total Achats USDT', amount: summary.totalUsdtPurchases || 0 },
      { type: 'Encaissements Cash Collect', amount: summary.totalCashCollectEncaissements || 0 },
      { type: 'Versements Cash Collect', amount: summary.totalCashCollectVersements || 0 },
    ];
  } catch (error) {
    message.error('Erreur lors du chargement des rapports');
  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  startDate.value = start.getTime();
  endDate.value = end.getTime();
  loadReports();
});
</script>

<style scoped>
.reports-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
