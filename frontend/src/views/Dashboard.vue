<template>
  <div class="dashboard-shell">
    <div class="neon-background" />
    <div class="grid-overlay" />
    <div class="dashboard-page">
      <section class="dashboard-hero glass-panel">
        <div class="hero-left">
          <div class="hero-eyebrow">Synthèse hebdomadaire</div>
          <div class="hero-title">
            <div>
              <h1>Monitoring global</h1>
              <p>
                Pilotage temps réel des opérations E-Cards, USDT et Cash Collect avec
                contrôle d'accès sécurisé OTP + JWT.
              </p>
            </div>
            <div class="hero-badge">
              <n-icon size="18" :component="ShieldCheckmarkOutline" />
              <span>Backoffice Head Office</span>
            </div>
          </div>
          <div class="hero-stats">
            <div class="hero-chip">
              <span>Dernière mise à jour</span>
              <strong>{{ lastUpdatedLabel }}</strong>
            </div>
            <div class="hero-chip">
              <span>Période sélectionnée</span>
              <strong>{{ dateRangeLabel }}</strong>
            </div>
          </div>
        </div>
        <div class="hero-right">
          <div class="control-card glass-panel">
            <p>Comparer une période</p>
            <n-date-picker
              v-model:value="dateRange"
              type="daterange"
              clearable
              :is-date-disabled="disableFutureDate"
              :actions="['now', 'confirm']"
              size="large"
              :loading="loading"
            />
            <n-button type="primary" block size="large" :loading="loading" @click="fetchStats">
              <template #icon>
                <n-icon :component="RefreshOutline" />
              </template>
              Actualiser les données
            </n-button>
          </div>
          <div class="hero-legend">
            <div>
              <small>Modules suivis</small>
              <p>E-Cards • USDT • Cash Collect</p>
            </div>
            <div>
              <small>Alertes critiques</small>
              <p class="legend-alert">0 en attente</p>
            </div>
          </div>
        </div>
      </section>

      <section class="kpi-section">
        <article v-for="card in kpiCards" :key="card.title" class="kpi-card" :class="card.accent">
          <div class="kpi-glow" />
          <div class="kpi-top">
            <div class="kpi-icon">
              <n-icon size="20" :component="card.icon" />
            </div>
            <span>{{ card.title }}</span>
            <n-tag size="small" round bordered type="success">{{ card.caption }}</n-tag>
          </div>
          <div class="kpi-value">
            <n-number-animation :from="0" :to="card.value" show-separator :duration="1200" />
            <small>{{ card.suffix }}</small>
          </div>
            <div class="kpi-meter">
              <div class="meter-bar">
                <div class="meter-fill" :style="{ width: card.progress + '%' }" />
              </div>
              <span>{{ card.progress }}% objectif</span>
            </div>
        </article>
      </section>


      <section class="insight-section">
        <n-card class="insight-card glass-panel" size="huge" :bordered="false">
          <template #header>
            <div class="insight-header">
              <div>
                <h3>Insights modules</h3>
                <p>Actions recommandées selon l'activité récente</p>
              </div>
              <n-tag size="large" round type="info" :bordered="false">
                Head Office & Comptable
              </n-tag>
            </div>
          </template>

          <div class="insight-grid">
            <article v-for="item in insightList" :key="item.title" class="insight-item">
              <header>
                <n-icon size="24" :component="item.icon" />
                <div>
                  <p class="insight-title">{{ item.title }}</p>
                  <small>{{ item.subtitle }}</small>
                </div>
              </header>
              <p class="insight-value">{{ item.value }}</p>
              <p class="insight-context">{{ item.context }}</p>
            </article>
          </div>
        </n-card>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import {
  NCard,
  NGrid,
  NGi,
  NSpace,
  NButton,
  NDatePicker,
  NNumberAnimation,
  NIcon,
  NTag,
} from 'naive-ui';
import { monitoringApi } from '@/api/monitoring';
import {
  RefreshOutline,
  CardOutline,
  SwapHorizontalOutline,
  WalletOutline,
  ShieldCheckmarkOutline,
  StatsChartOutline,
  CashOutline,
} from '@vicons/ionicons5';

const stats = ref({
  eCardsPurchases: 0,
  eCardsSales: 0,
  usdtPurchases: 0,
  supplierBalance: 0,
});

const loading = ref(false);
const lastUpdated = ref<Date | null>(null);
const chartSeries = ref({
  ecardSalesByCountry: [] as Array<{ name: string; value: number }>,
  usdtByCountry: [] as Array<{ name: string; value: number }>,
  cashFlow: {
    encaissements: 0,
    versements: 0,
  },
  cashEncaissementByCountry: [] as Array<{ name: string; value: number }>,
});

const defaultEnd = new Date();
const defaultStart = new Date();
defaultStart.setDate(defaultStart.getDate() - 7);

const dateRange = ref<[number, number] | null>([
  defaultStart.getTime(),
  defaultEnd.getTime(),
]);

const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return 'en attente';
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(lastUpdated.value);
});

const dateRangeLabel = computed(() => {
  if (!dateRange.value) return 'Non définie';
  const [start, end] = dateRange.value;
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' });
  return `${formatter.format(start)} → ${formatter.format(end)}`;
});
const fetchStats = async () => {
  if (!dateRange.value) return;
  loading.value = true;
  const [startMs, endMs] = dateRange.value;
  const startDate = new Date(startMs);
  const endDate = new Date(endMs);

  try {
    const [eCards, usdt, cash] = await Promise.all([
      monitoringApi.eCards(startDate.toISOString(), endDate.toISOString()),
      monitoringApi.usdt(startDate.toISOString(), endDate.toISOString()),
      monitoringApi.cashCollect(startDate.toISOString(), endDate.toISOString()),
    ]);

    stats.value = {
      eCardsPurchases: eCards.data?.totalPurchaseVolume || 0,
      eCardsSales: eCards.data?.totalSaleVolume || 0,
      usdtPurchases: usdt.data?.totalVolume || 0,
      supplierBalance: eCards.data?.directPurchaseVolume || 0,
    };
    chartSeries.value = {
      ecardSalesByCountry: Object.entries(eCards.data?.salesByCountry || {}).map(([name, value]) => ({
        name,
        value: Number(value),
      })),
      usdtByCountry: Object.entries(usdt.data?.purchasesByCountry || {}).map(([name, value]) => ({
        name,
        value: Number(value),
      })),
      cashFlow: {
        encaissements: Number(cash.data?.totalEncaissements || 0),
        versements: Number(cash.data?.totalVersements || 0),
      },
      cashEncaissementByCountry: Object.entries(cash.data?.encaissementsByCountry || {}).map(
        ([name, value]) => ({
          name,
          value: Number(value),
        }),
      ),
    };
    lastUpdated.value = new Date();
  } catch (error) {
    console.error('Erreur monitoring dashboard', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchStats);

watch(
  dateRange,
  (val, oldVal) => {
    if (!val) return;
    if (!oldVal || val[0] !== oldVal[0] || val[1] !== oldVal[1]) {
      fetchStats();
    }
  },
  { deep: true },
);

const disableFutureDate = (ts: number) => ts > Date.now();

const kpiCards = computed(() => [
  {
    title: 'Volume achat E-Cards',
    value: stats.value.eCardsPurchases,
    suffix: 'USD',
    caption: formatCurrency(stats.value.eCardsPurchases),
    type: 'success',
    icon: CardOutline,
    accent: 'accent-blue',
    progress: 72,
  },
  {
    title: 'Volume vente E-Cards',
    value: stats.value.eCardsSales,
    suffix: 'USD',
    caption: formatCurrency(stats.value.eCardsSales),
    type: 'info',
    icon: SwapHorizontalOutline,
    accent: 'accent-purple',
    progress: 64,
  },
  {
    title: 'Volume achat USDT',
    value: stats.value.usdtPurchases,
    suffix: 'USD',
    caption: formatCurrency(stats.value.usdtPurchases),
    type: 'warning',
    icon: WalletOutline,
    accent: 'accent-gold',
    progress: 55,
  },
  {
    title: 'Solde fournisseurs E-Cards',
    value: stats.value.supplierBalance,
    suffix: 'USD',
    caption: formatCurrency(stats.value.supplierBalance),
    type: 'success',
    icon: CashOutline,
    accent: 'accent-green',
    progress: 81,
  },
]);

const ecardCountryChart = computed(() => {
  const data = chartSeries.value.ecardSalesByCountry;
  if (!data.length) {
    return {
      title: { text: 'Aucune donnée', left: 'center', textStyle: { fontSize: 14 } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [] }],
    };
  }
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: data.map((item) => item.name),
      axisLabel: { rotate: data.length > 6 ? 30 : 0 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Ventes',
        type: 'bar',
        itemStyle: { color: '#3b82f6' },
        data: data.map((item) => item.value),
      },
    ],
  };
});

const usdtCountryChart = computed(() => {
  const data = chartSeries.value.usdtByCountry;
  if (!data.length) {
    return {
      title: { text: 'Aucune donnée', left: 'center', textStyle: { fontSize: 14 } },
      series: [{ type: 'pie', data: [] }],
    };
  }
  return {
    tooltip: { 
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: { bottom: 0, left: 'center' },
    series: [
      {
        name: 'Achats USDT',
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '45%'],
        data: data.map((item) => ({ name: item.name, value: item.value })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
});

const cashFlowChart = computed(() => {
  const encaissements = chartSeries.value.cashFlow.encaissements;
  const versements = chartSeries.value.cashFlow.versements;
  const byCountry = chartSeries.value.cashEncaissementByCountry;

  if (!encaissements && !versements) {
    return {
      title: { text: 'Aucune donnée', left: 'center', textStyle: { fontSize: 14 } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [] }],
    };
  }

  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, left: 'center' },
    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Encaissements', 'Versements'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        name: 'Montant',
        data: [encaissements, versements],
        itemStyle: {
          color: (params: any) => (params.dataIndex === 0 ? '#22c55e' : '#ef4444'),
        },
      },
      {
        type: 'line',
        name: 'Encaissements par pays',
        data: [
          encaissements,
          byCountry.reduce((sum: number, item: any) => sum + item.value, 0),
        ],
        smooth: true,
        itemStyle: { color: '#8b5cf6' },
      },
    ],
  };
});

const cashCountryMiniChart = computed(() => {
  const data = chartSeries.value.cashEncaissementByCountry;
  if (!data.length) {
    return {
      title: { text: 'Aucune donnée', left: 'center', textStyle: { color: '#cbd5f5' } },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: [] }],
    };
  }
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '2%', right: '2%', bottom: '6%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.name),
      axisLabel: { color: '#cbd5f5', rotate: data.length > 4 ? 30 : 0 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#cbd5f5' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#a855f7' },
        areaStyle: { color: 'rgba(168,85,247,0.35)' },
        data: data.map((item) => item.value),
      },
    ],
  };
});

const ecardProgressionChart = computed(() => {
  const data = chartSeries.value.ecardSalesByCountry;
  if (!data.length) {
    return {
      title: { text: 'Aucune donnée', left: 'center', textStyle: { fontSize: 14 } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: [] }],
    };
  }
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((item: any) => item.name),
      axisLabel: { rotate: data.length > 6 ? 30 : 0 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Ventes',
        type: 'line',
        smooth: true,
        data: data.map((item: any) => item.value),
        itemStyle: { color: '#3b82f6' },
        areaStyle: { color: 'rgba(59, 130, 246, 0.2)' },
      },
    ],
  };
});

const usdtProgressionChart = computed(() => {
  const data = chartSeries.value.usdtByCountry;
  if (!data.length) {
    return {
      title: { text: 'Aucune donnée', left: 'center', textStyle: { fontSize: 14 } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: [] }],
    };
  }
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((item: any) => item.name),
      axisLabel: { rotate: data.length > 6 ? 30 : 0 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Achats',
        type: 'line',
        smooth: true,
        data: data.map((item: any) => item.value),
        itemStyle: { color: '#8b5cf6' },
        areaStyle: { color: 'rgba(139, 92, 246, 0.2)' },
      },
    ],
  };
});

const cashCollectPieChart = computed(() => {
  const encaissements = chartSeries.value.cashFlow.encaissements;
  const versements = chartSeries.value.cashFlow.versements;
  
  if (!encaissements && !versements) {
    return {
      title: { text: 'Aucune donnée', left: 'center', textStyle: { fontSize: 14 } },
      series: [{ type: 'pie', data: [] }],
    };
  }
  
  return {
    tooltip: { 
      trigger: 'item', 
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: { bottom: 0, left: 'center' },
    series: [
      {
        name: 'Cash Collect',
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '45%'],
        data: [
          { name: 'Encaissements', value: encaissements },
          { name: 'Versements', value: versements },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
});

const hasEcardData = computed(() => chartSeries.value.ecardSalesByCountry.length > 0);
const hasUsdtData = computed(() => chartSeries.value.usdtByCountry.length > 0);
const hasCashFlowData = computed(() => {
  const encaissements = chartSeries.value.cashFlow.encaissements;
  const versements = chartSeries.value.cashFlow.versements;
  return encaissements > 0 || versements > 0;
});
const hasCashCountryData = computed(() => chartSeries.value.cashEncaissementByCountry.length > 0);

const insightList = computed(() => [
  {
    title: 'Approvisionnement E-Cards',
    subtitle: 'Taux & devises',
    value: formatCurrency(stats.value.eCardsPurchases),
    context: 'Valider les taux proposés par les fournisseurs actifs.',
    icon: CardOutline,
  },
  {
    title: 'Flux USDT',
    subtitle: 'Par pays & fournisseurs',
    value: formatCurrency(stats.value.usdtPurchases),
    context: 'Synchroniser les preuves de paiement sur 5 ans.',
    icon: WalletOutline,
  },
  {
    title: 'Cash Collect',
    subtitle: 'Encaissement / versement',
    value: formatCurrency(stats.value.supplierBalance),
    context: 'Analyser les corridors pour équilibrer les soldes.',
    icon: CashOutline,
  },
]);
</script>

<style scoped>
.dashboard-shell {
  position: relative;
  min-height: calc(100vh - 64px);
  padding: 32px;
  background: #f8fbf9;
}

.neon-background,
.grid-overlay {
  display: none;
}

.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 1;
  color: #0f172a;
}

.glass-panel {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(16, 185, 129, 0.12);
  border-radius: 24px;
  padding: 24px;
  color: #0f172a;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
}

.dashboard-hero {
  display: grid;
  grid-template-columns: minmax(320px, 2fr) minmax(280px, 1fr);
  gap: 32px;
  padding: 32px;
}

.hero-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  color: #0f9d58;
}

.hero-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.hero-title h1 {
  font-size: 36px;
  margin: 0;
  color: #0f172a;
}

.hero-left p {
  max-width: 540px;
  margin: 8px 0 16px;
  color: #475569;
  line-height: 1.7;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.08);
  color: #0f5132;
}

.hero-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-chip {
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-width: 180px;
}

.hero-chip span {
  display: block;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: rgba(15, 23, 42, 0.5);
}

.hero-chip strong {
  display: block;
  margin-top: 4px;
  font-size: 14px;
  color: #0f172a;
}

.hero-right {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-legend {
  display: flex;
  justify-content: space-between;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.hero-legend small {
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: rgba(15, 23, 42, 0.5);
}

.hero-legend p {
  margin: 4px 0 0;
  color: #0f172a;
}

.legend-alert {
  color: #059669;
}

.kpi-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.kpi-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 20px;
  color: #0f172a;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  background: #ffffff;
}

.kpi-glow {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  filter: blur(40px);
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-transform: uppercase;
  font-size: 11px;
  color: rgba(15, 23, 42, 0.65);
}

.kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.15);
  color: #0f5132;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 34px;
  font-weight: 700;
  color: #0f172a;
}

.kpi-meter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.meter-bar {
  flex: 1;
  height: 6px;
  background: rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  margin-right: 12px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #0f9d58, #99f6e4);
}

.chart-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.progression-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.highlight-card {
  border: 1px solid rgba(16, 185, 129, 0.15);
}

.focus-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.focus-grid small {
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: rgba(15, 23, 42, 0.55);
}

.focus-grid strong {
  display: block;
  font-size: 18px;
  color: #0f172a;
}

.insight-section {
  margin-top: 12px;
}

.insight-card {
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
}

.insight-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin-top: 12px;
}

.insight-item {
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(16, 185, 129, 0.12);
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #0f172a;
}

.insight-title {
  margin: 0;
  font-weight: 600;
  color: #0f172a;
}

.insight-value {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f5132;
}

.insight-context {
  margin: 0;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.7);
}

.accent-blue {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
}

.accent-purple {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
}

.accent-gold {
  background: linear-gradient(135deg, #f0fdfa, #ccfbf1);
}

.accent-green {
  background: linear-gradient(135deg, #f4fdf7, #defce6);
}

@media (max-width: 1024px) {
  .dashboard-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-shell {
    padding: 16px;
  }

  .dashboard-hero {
    padding: 24px;
  }
}
</style>