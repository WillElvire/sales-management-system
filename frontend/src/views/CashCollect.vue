<template>
  <div class="module-page">
    <n-tabs type="segment" animated>
      <n-tab-pane name="agents" tab="Agents collecteurs">
        <n-card>
          <template #header>
            <div class="card-header">
              <div>
                <h3>Agents & corridors</h3>
                <p>Suivi des soldes par pays / devise</p>
              </div>
              <n-button type="primary" @click="showAgentModal = true">Ajouter un agent</n-button>
            </div>
          </template>
          <n-data-table :columns="agentColumns" :data="agents" :loading="loading" />
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="transactions" tab="Transactions (Encaissement / Versement)">
        <n-card>
          <template #header>
            <div class="card-header">
              <div>
                <h3>Flux cash collect</h3>
                <p>Encaissement par pays, versement fournisseur / trésorerie</p>
              </div>
              <n-button type="primary" @click="showTransactionModal = true">Nouvelle transaction</n-button>
            </div>
          </template>
          <n-data-table :columns="transactionColumns" :data="transactions" :loading="loading" />
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="balance" tab="Synthèse soldes">
        <n-card>
          <template #header>
            <h3>Solde par agent</h3>
          </template>
          <n-data-table :columns="balanceColumns" :data="balanceRows" :loading="loading" />
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <!-- Modale agent -->
    <n-modal
      v-model:show="showAgentModal"
      preset="card"
      title="Nouvel agent Cash Collect"
      :mask-closable="false"
      :style="{ width: '520px', maxWidth: '90%' }"
    >
      <n-form ref="agentFormRef" :model="agentForm" :rules="agentRules" label-placement="top">
        <n-form-item label="Nom de l'agent" path="name">
          <n-input v-model:value="agentForm.name" placeholder="Ex: Agence Dakar Plateau" />
        </n-form-item>
        <n-form-item label="Pays" path="country">
          <n-select
            v-model:value="agentForm.country"
            :options="countryOptions"
            filterable
            placeholder="Sélectionnez un pays"
          />
        </n-form-item>
        <n-form-item label="Devise" path="currency">
          <n-input v-model:value="agentForm.currency" placeholder="Ex: XOF" />
        </n-form-item>
   
        <n-form-item label="Statut" path="status">
          <n-radio-group v-model:value="agentForm.status">
            <n-space>
              <n-radio value="active">Actif</n-radio>
              <n-radio value="inactive">Inactif</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button quaternary @click="closeAgentModal">Annuler</n-button>
          <n-button type="primary" :loading="submitting" @click="handleCreateAgent">
            Sauvegarder
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Modale transaction -->
    <n-modal
      v-model:show="showTransactionModal"
      preset="card"
      title="Nouvelle transaction Cash Collect"
      :mask-closable="false"
      :style="{ width: '560px', maxWidth: '95%' }"
    >
      <n-form ref="transactionFormRef" :model="transactionForm" :rules="transactionRules" label-placement="top">
        <n-form-item label="Agent collecteur" path="agentId">
          <n-select
            v-model:value="transactionForm.agentId"
            :options="agentOptions"
            filterable
            placeholder="Sélectionnez un agent"
          />
        </n-form-item>
        <n-form-item label="Type de mouvement" path="type">
          <n-radio-group v-model:value="transactionForm.type">
            <n-space>
              <n-radio value="encaissement">Encaissement</n-radio>
              <n-radio value="versement">Versement</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-grid cols="1 m:2" :x-gap="12">
          <n-gi>
            <n-form-item label="Montant" path="amount">
              <n-input-number v-model:value="transactionForm.amount" min="0" placeholder="0" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Devise" path="currency">
              <n-input v-model:value="transactionForm.currency" placeholder="Devise opération" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="Pays" path="country">
          <n-select
            v-model:value="transactionForm.country"
            :options="countryOptions"
            filterable
            placeholder="Sélectionnez un pays"
          />
        </n-form-item>
        <n-form-item v-if="transactionForm.type === 'versement'" label="Destination" path="destination">
          <n-select
            v-model:value="transactionForm.destination"
            :options="destinationOptions"
            placeholder="Choisir destination"
          />
        </n-form-item>
        <n-form-item v-if="transactionForm.destination" label="Référence / bénéficiaire" path="destinationName">
          <n-input v-model:value="transactionForm.destinationName" placeholder="Trésorerie Abidjan, Fournisseur..." />
        </n-form-item>
        <n-form-item label="Date" path="transactionDate">
          <n-date-picker v-model:value="transactionForm.transactionDate" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Notes" path="notes">
          <n-input v-model:value="transactionForm.notes" type="textarea" placeholder="Détails supplémentaires" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button quaternary @click="closeTransactionModal">Annuler</n-button>
          <n-button type="primary" :loading="submitting" @click="handleCreateTransaction">
            Enregistrer
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { cashCollectApi } from '@/api/cash-collect';
import { countriesApi } from '@/api/countries';
import type { DataTableColumns, FormInst } from 'naive-ui';

const message = useMessage();
const agents = ref<any[]>([]);
const transactions = ref<any[]>([]);
const countries = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);

const showAgentModal = ref(false);
const showTransactionModal = ref(false);

const agentColumns: DataTableColumns = [
  { title: 'Nom', key: 'name' },
  { title: 'Pays', key: 'country' },
  { title: 'Devise', key: 'currency' },
  { title: 'Solde', key: 'balance' },
  { title: 'Statut', key: 'status' },
];

const transactionColumns: DataTableColumns = [
  {
    title: 'Agent',
    key: 'agent',
    render: (row: any) => row.agent?.name || '—',
  },
  { title: 'Type', key: 'type' },
  { title: 'Montant', key: 'amount' },
  { title: 'Devise', key: 'currency' },
  { title: 'Pays', key: 'country' },
  { title: 'Destination', key: 'destination' },
  {
    title: 'Date',
    key: 'transactionDate',
    render: (row: any) => new Date(row.transactionDate).toLocaleString(),
  },
];

const balanceColumns: DataTableColumns = [
  { title: 'Agent', key: 'agent' },
  { title: 'Devise', key: 'currency' },
  { title: 'Solde', key: 'balance' },
];

const balanceRows = computed(() =>
  agents.value.map((agent) => ({
    agent: agent.name,
    currency: agent.currency,
    balance: agent.balance,
  })),
);

const agentOptions = computed(() =>
  agents.value.map((agent) => ({ label: `${agent.name} (${agent.country})`, value: agent.id })),
);

const countryOptions = computed(() =>
  countries.value
    .filter((country) => country.isActive)
    .map((country) => ({ label: country.name, value: country.name })),
);

const destinationOptions = [
  { label: 'Fournisseur', value: 'Fournisseur' },
  { label: 'Organisation', value: 'Organisation' },
  { label: 'Trésorerie', value: 'Trésorerie' },
];

const agentFormRef = ref<FormInst | null>(null);
const transactionFormRef = ref<FormInst | null>(null);

const agentForm = reactive({
  name: '',
  country: '',
  currency: 'USD',
 // balance: 0,
  status: 'active',
});

const transactionForm = reactive({
  agentId: null as string | null,
  type: 'encaissement',
  amount: null as number | null,
  currency: 'USD',
  country: '',
  destination: null as string | null,
  destinationName: '',
  transactionDate: Date.now(),
  notes: '',
});

const agentRules = {
  name: { required: true, message: 'Nom requis' },
  country: { required: true, message: 'Pays requis' },
  currency: { required: true, message: 'Devise requise' },
};

const transactionRules = {
  agentId: { required: true, message: 'Agent requis' },
  amount: { type: 'number', required: true, message: 'Montant requis' },
  currency: { required: true, message: 'Devise requise' },
  country: { required: true, message: 'Pays requis' },
};

const resetForm = <T extends Record<string, any>>(form: T, defaults: T) => {
  Object.keys(form).forEach((key) => {
    form[key as keyof T] = defaults[key as keyof T];
  });
};

const loadData = async () => {
  loading.value = true;
  try {
    const [agentsRes, transactionsRes, countriesRes] = await Promise.all([
      cashCollectApi.agents.getAll(),
      cashCollectApi.transactions.getAll(),
      countriesApi.getAll(),
    ]);
    agents.value = agentsRes.data || [];
    transactions.value = transactionsRes.data || [];
    countries.value = countriesRes.data || [];
  } catch (error: any) {
    message.error(error?.message || 'Erreur lors du chargement Cash Collect');
  } finally {
    loading.value = false;
  }
};

const closeAgentModal = () => {
  showAgentModal.value = false;
  agentFormRef.value?.restoreValidation();
  resetForm(agentForm, {
    name: '',
    country: '',
    currency: 'USD',
    //balance: 0,
    status: 'active',
  });
};

const closeTransactionModal = () => {
  showTransactionModal.value = false;
  transactionFormRef.value?.restoreValidation();
  resetForm(transactionForm, {
    agentId: null,
    type: 'encaissement',
    amount: null,
    currency: 'USD',
    country: '',
    destination: null,
    destinationName: '',
    transactionDate: Date.now(),
    notes: '',
  });
};

const handleCreateAgent = async () => {
  try {
    await agentFormRef.value?.validate();
    submitting.value = true;
    await cashCollectApi.agents.create({
      ...agentForm,
      //balance: Number(agentForm.balance || 0),
    });
    message.success('Agent ajouté');
    closeAgentModal();
    loadData();
  } catch (error: any) {
    message.error(error?.message || 'Impossible de créer l’agent');
  } finally {
    submitting.value = false;
  }
};

const handleCreateTransaction = async () => {
  try {
    await transactionFormRef.value?.validate();
    if (!transactionForm.agentId) {
      message.error('Veuillez sélectionner un agent');
      return;
    }
    submitting.value = true;
    const payload: any = {
      agentId: transactionForm.agentId,
      type: transactionForm.type,
      amount: Number(transactionForm.amount),
      currency: transactionForm.currency,
      country: transactionForm.country,
      transactionDate: new Date(transactionForm.transactionDate).toISOString(),
    };
    if (transactionForm.destination) {
      payload.destination = transactionForm.destination;
    }
    if (transactionForm.destinationName) {
      payload.destinationName = transactionForm.destinationName;
    }
    if (transactionForm.notes) {
      payload.notes = transactionForm.notes;
    }
    await cashCollectApi.transactions.create(payload);
    message.success('Transaction enregistrée');
    closeTransactionModal();
    loadData();
  } catch (error: any) {
    message.error(error?.message || 'Impossible d’enregistrer la transaction');
  } finally {
    submitting.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
.module-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.card-header h3 {
  margin: 0;
}

.card-header p {
  margin: 4px 0 0;
  color: #64748b;
}
</style>

