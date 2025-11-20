<template>
  <div class="module-page">
    <n-tabs type="segment" animated>
      <n-tab-pane name="suppliers" tab="Fournisseurs">
        <n-card>
          <template #header>
            <div class="card-header">
              <div>
                <h3>Fournisseurs USDT TRC20</h3>
                <p>Gestion des adresses, modes et soldes</p>
              </div>
              <n-button type="primary" @click="showSupplierModal = true">Ajouter un fournisseur</n-button>
            </div>
          </template>
          <n-data-table :columns="supplierColumns" :data="suppliers" :loading="loading" />
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="purchases" tab="Approvisionnements">
        <n-card>
          <template #header>
            <div class="card-header">
              <div>
                <h3>Achats USDT</h3>
                <p>Par pays, devise et taux</p>
              </div>
              <n-button type="primary" @click="showPurchaseModal = true">Enregistrer un achat</n-button>
            </div>
          </template>
          <n-data-table :columns="purchaseColumns" :data="purchases" :loading="loading" />
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="accounts" tab="Comptes fournisseurs">
        <n-card>
          <template #header>
            <div class="card-header">
              <div>
                <h3>Comptes liés</h3>
                <p>Activation / désactivation des wallets</p>
              </div>
              <n-button type="primary" @click="showAccountModal = true">Associer un compte</n-button>
            </div>
          </template>
          <n-data-table :columns="accountColumns" :data="accounts" :loading="loading" />
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <!-- Modale fournisseur -->
    <n-modal
      v-model:show="showSupplierModal"
      preset="card"
      title="Nouveau fournisseur USDT"
      :mask-closable="false"
      :style="{ width: '520px', maxWidth: '90%' }"
    >
      <n-form ref="supplierFormRef" :model="supplierForm" :rules="supplierRules" label-placement="top">
        <n-form-item label="Nom du fournisseur" path="name">
          <n-input v-model:value="supplierForm.name" placeholder="Ex: Liquidity Hub" />
        </n-form-item>
        <n-form-item label="Pays" path="country">
          <n-select
            v-model:value="supplierForm.country"
            :options="countryOptions"
            filterable
            placeholder="Sélectionnez un pays"
          />
        </n-form-item>
        <n-form-item label="Adresse USDT TRC20" path="trc20Address">
          <n-input v-model:value="supplierForm.trc20Address" placeholder="TX...." />
        </n-form-item>
        <n-form-item label="Mode de règlement" path="paymentMethod">
          <n-select
            v-model:value="supplierForm.paymentMethod"
            :options="paymentMethodOptions"
            placeholder="Mode utilisé"
          />
        </n-form-item>
        <n-form-item label="Statut actif" path="isActive">
          <n-switch v-model:value="supplierForm.isActive" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button quaternary @click="closeSupplierModal">Annuler</n-button>
          <n-button type="primary" :loading="submitting" @click="handleCreateSupplier">
            Sauvegarder
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Modale achat -->
    <n-modal
      v-model:show="showPurchaseModal"
      preset="card"
      title="Nouvel achat USDT"
      :mask-closable="false"
      :style="{ width: '560px', maxWidth: '95%' }"
    >
      <n-form ref="purchaseFormRef" :model="purchaseForm" :rules="purchaseRules" label-placement="top">
        <n-form-item label="Fournisseur" path="supplierId">
          <n-select
            v-model:value="purchaseForm.supplierId"
            :options="supplierOptions"
            filterable
            placeholder="Sélectionnez"
          />
        </n-form-item>
        <n-grid cols="1 m:2" :x-gap="12">
          <n-gi>
            <n-form-item label="Montant" path="amount">
              <n-input-number v-model:value="purchaseForm.amount" min="0" placeholder="0" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Taux" path="rate">
              <n-input-number v-model:value="purchaseForm.rate" min="0" placeholder="0" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="Devise" path="currency">
          <n-input v-model:value="purchaseForm.currency" placeholder="USD" />
        </n-form-item>
        <n-form-item label="Pays" path="country">
          <n-select
            v-model:value="purchaseForm.country"
            :options="countryOptions"
            filterable
            placeholder="Sélectionnez un pays"
          />
        </n-form-item>
        <n-form-item label="Notes" path="notes">
          <n-input v-model:value="purchaseForm.notes" type="textarea" placeholder="Commentaires" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button quaternary @click="closePurchaseModal">Annuler</n-button>
          <n-button type="primary" :loading="submitting" @click="handleCreatePurchase">
            Enregistrer
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Modale compte -->
    <n-modal
      v-model:show="showAccountModal"
      preset="card"
      title="Associer un compte fournisseur"
      :mask-closable="false"
      :style="{ width: '520px', maxWidth: '90%' }"
    >
      <n-form ref="accountFormRef" :model="accountForm" :rules="accountRules" label-placement="top">
        <n-form-item label="Fournisseur" path="supplierId">
          <n-select v-model:value="accountForm.supplierId" :options="supplierOptions" placeholder="Sélectionnez" />
        </n-form-item>
        <n-form-item label="Nom / Référence du compte" path="accountName">
          <n-input v-model:value="accountForm.accountName" placeholder="Wallet Dubai 01" />
        </n-form-item>
        <n-form-item label="Statut" path="status">
          <n-radio-group v-model:value="accountForm.status">
            <n-space>
              <n-radio value="active">Actif</n-radio>
              <n-radio value="inactive">Inactif</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button quaternary @click="closeAccountModal">Annuler</n-button>
          <n-button type="primary" :loading="submitting" @click="handleCreateAccount">
            Associer
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { usdtApi } from '@/api/usdt';
import { countriesApi } from '@/api/countries';
import type { DataTableColumns, FormInst } from 'naive-ui';

const message = useMessage();
const suppliers = ref<any[]>([]);
const purchases = ref<any[]>([]);
const accounts = ref<any[]>([]);
const countries = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);

const showSupplierModal = ref(false);
const showPurchaseModal = ref(false);
const showAccountModal = ref(false);

const paymentMethodOptions = [
  { label: 'Banque', value: 'Banque' },
  { label: 'Cash', value: 'Cash' },
  { label: 'Mobile Money', value: 'Mobile Money' },
];

const supplierColumns: DataTableColumns = [
  { title: 'Nom', key: 'name' },
  { title: 'Pays', key: 'country' },
  { title: 'Adresse TRC20', key: 'trc20Address' },
  { title: 'Mode de règlement', key: 'paymentMethod' },
  { title: 'Solde', key: 'balance' },
];

const purchaseColumns: DataTableColumns = [
  {
    title: 'Fournisseur',
    key: 'supplier',
    render: (row: any) => row.supplier?.name || '—',
  },
  { title: 'Montant', key: 'amount' },
  { title: 'Taux', key: 'rate' },
  { title: 'Devise', key: 'currency' },
  { title: 'Pays', key: 'country' },
  {
    title: 'Date',
    key: 'createdAt',
    render: (row: any) => new Date(row.createdAt).toLocaleString(),
  },
];

const accountColumns: DataTableColumns = [
  {
    title: 'Fournisseur',
    key: 'supplier',
    render: (row: any) => row.supplier?.name || '—',
  },
  { title: 'Compte', key: 'accountName' },
  { title: 'Statut', key: 'status' },
  {
    title: 'Créé le',
    key: 'createdAt',
    render: (row: any) => new Date(row.createdAt).toLocaleString(),
  },
];

const supplierOptions = computed(() =>
  suppliers.value.map((supplier) => ({ label: supplier.name, value: supplier.id })),
);

const countryOptions = computed(() =>
  countries.value
    .filter((country) => country.isActive)
    .map((country) => ({ label: country.name, value: country.name })),
);

const supplierFormRef = ref<FormInst | null>(null);
const purchaseFormRef = ref<FormInst | null>(null);
const accountFormRef = ref<FormInst | null>(null);

const supplierForm = reactive({
  name: '',
  country: '',
  trc20Address: '',
  paymentMethod: null as string | null,
  isActive: true,
});

const purchaseForm = reactive({
  supplierId: null as string | null,
  amount: null as number | null,
  rate: null as number | null,
  currency: 'USD',
  country: '',
  notes: '',
});

const accountForm = reactive({
  supplierId: null as string | null,
  accountName: '',
  status: 'active',
});

const supplierRules = {
  name: { required: true, message: 'Nom requis' },
  country: { required: true, message: 'Pays requis' },
  trc20Address: { required: true, message: 'Adresse TRC20 requise' },
  paymentMethod: { required: true, message: 'Mode requis' },
};

const purchaseRules = {
  supplierId: { required: true, message: 'Fournisseur requis' },
  amount: { type: 'number', required: true, message: 'Montant requis' },
  rate: { type: 'number', required: true, message: 'Taux requis' },
  currency: { required: true, message: 'Devise requise' },
  country: { required: true, message: 'Pays requis' },
};

const accountRules = {
  supplierId: { required: true, message: 'Fournisseur requis' },
  accountName: { required: true, message: 'Nom requis' },
};

const resetForm = <T extends Record<string, any>>(form: T, defaults: T) => {
  Object.keys(form).forEach((key) => {
    form[key as keyof T] = defaults[key as keyof T];
  });
};

const loadData = async () => {
  loading.value = true;
  try {
    const [suppliersRes, purchasesRes, accountsRes, countriesRes] = await Promise.all([
      usdtApi.suppliers.getAll(),
      usdtApi.purchases.getAll(),
      usdtApi.accounts.getAll(),
      countriesApi.getAll(),
    ]);
    suppliers.value = suppliersRes.data || [];
    purchases.value = purchasesRes.data || [];
    accounts.value = accountsRes.data || [];
    countries.value = countriesRes.data || [];
  } catch (error: any) {
    message.error(error?.message || 'Erreur lors du chargement USDT');
  } finally {
    loading.value = false;
  }
};

const closeSupplierModal = () => {
  showSupplierModal.value = false;
  supplierFormRef.value?.restoreValidation();
  resetForm(supplierForm, {
    name: '',
    country: '',
    trc20Address: '',
    paymentMethod: null,
    isActive: true,
  });
};

const closePurchaseModal = () => {
  showPurchaseModal.value = false;
  purchaseFormRef.value?.restoreValidation();
  resetForm(purchaseForm, {
    supplierId: null,
    amount: null,
    rate: null,
    currency: 'USD',
    country: '',
    notes: '',
  });
};

const closeAccountModal = () => {
  showAccountModal.value = false;
  accountFormRef.value?.restoreValidation();
  resetForm(accountForm, {
    supplierId: null,
    accountName: '',
    status: 'active',
  });
};

const handleCreateSupplier = async () => {
  try {
    await supplierFormRef.value?.validate();
    submitting.value = true;
    await usdtApi.suppliers.create({ ...supplierForm });
    message.success('Fournisseur USDT créé');
    closeSupplierModal();
    loadData();
  } catch (error: any) {
    message.error(error?.message || 'Création impossible');
  } finally {
    submitting.value = false;
  }
};

const handleCreatePurchase = async () => {
  try {
    await purchaseFormRef.value?.validate();
    submitting.value = true;
    await usdtApi.purchases.create({
      ...purchaseForm,
      amount: Number(purchaseForm.amount),
      rate: Number(purchaseForm.rate),
    });
    message.success('Achat USDT enregistré');
    closePurchaseModal();
    loadData();
  } catch (error: any) {
    message.error(error?.message || 'Impossible d’enregistrer l’achat');
  } finally {
    submitting.value = false;
  }
};

const handleCreateAccount = async () => {
  try {
    await accountFormRef.value?.validate();
    submitting.value = true;
    await usdtApi.accounts.create({ ...accountForm });
    message.success('Compte fournisseur ajouté');
    closeAccountModal();
    loadData();
  } catch (error: any) {
    message.error(error?.message || 'Impossible de créer le compte');
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
