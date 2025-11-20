<template>
  <div class="module-page">
    <n-tabs type="segment" animated>
      <n-tab-pane name="suppliers" tab="Fournisseurs">
        <n-card>
          <template #header>
            <div class="card-header">
              <div>
                <h3>Fournisseurs E-Cards</h3>
                <p>Solde, pays et modes de règlement</p>
              </div>
              <n-button type="primary" @click="showSupplierModal = true">
                Ajouter un fournisseur
              </n-button>
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
                <h3>Achats E-Cards</h3>
                <p>Direct ou crédit avec échéancier</p>
              </div>
              <n-button type="primary" @click="showPurchaseModal = true">Enregistrer un achat</n-button>
            </div>
          </template>
          <n-data-table :columns="purchaseColumns" :data="purchases" :loading="loading" />
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="sales" tab="Ventes">
        <n-card>
          <template #header>
            <div class="card-header">
              <div>
                <h3>Ventes par pays</h3>
                <p>Suivi périodique des volumes</p>
              </div>
              <n-space>
                <n-button @click="handleExportSales('pdf')">
                  <template #icon>
                    <n-icon><DocumentTextOutline /></n-icon>
                  </template>
                  PDF
                </n-button>
                <n-button @click="handleExportSales('xlsx')">
                  <template #icon>
                    <n-icon><DocumentTextOutline /></n-icon>
                  </template>
                  Excel
                </n-button>
                <n-button type="primary" @click="showSaleModal = true">Déclarer une vente</n-button>
              </n-space>
            </div>
          </template>
          <n-data-table :columns="saleColumns" :data="sales" :loading="loading" />
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="payments" tab="Règlements fournisseurs">
        <n-card>
          <template #header>
            <div class="card-header">
              <div>
                <h3>Preuves de règlement</h3>
                <p>Upload et historique (5 ans)</p>
              </div>
              <n-button type="primary" @click="showPaymentModal = true">
                Ajouter un règlement
              </n-button>
            </div>
          </template>
          <n-data-table :columns="paymentColumns" :data="payments" :loading="loading" />
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <!-- Modale fournisseur -->
    <n-modal
      v-model:show="showSupplierModal"
      preset="card"
      title="Nouveau fournisseur E-Cards"
      :mask-closable="false"
      :style="{ width: '520px', maxWidth: '90%' }"
    >
      <n-form ref="supplierFormRef" :model="supplierForm" :rules="supplierRules" label-placement="top">
        <n-form-item label="Nom du fournisseur" path="name">
          <n-input v-model:value="supplierForm.name" placeholder="Ex: Digital Cards Ltd" />
        </n-form-item>
        <n-form-item label="Pays" path="country">
          <n-select
            v-model:value="supplierForm.country"
            :options="countryOptions"
            filterable
            placeholder="Sélectionnez un pays"
          />
        </n-form-item>
       
        <n-form-item label="Mode de règlement préféré" path="paymentMethod">
          <n-select
            v-model:value="supplierForm.paymentMethod"
            :options="paymentMethodOptions"
            placeholder="Sélectionnez"
          />
        </n-form-item>
        <n-form-item label="Actif" path="isActive">
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
      title="Nouvel achat E-Cards"
      :mask-closable="false"
      :style="{ width: '560px', maxWidth: '95%' }"
    >
      <n-form ref="purchaseFormRef" :model="purchaseForm" :rules="purchaseRules" label-placement="top">
        <n-form-item label="Fournisseur" path="supplierId">
          <n-select
            v-model:value="purchaseForm.supplierId"
            :options="supplierOptions"
            filterable
            placeholder="Sélectionnez un fournisseur"
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
        <n-form-item label="Type d'achat" path="type">
          <n-radio-group v-model:value="purchaseForm.type">
            <n-space>
              <n-radio value="direct">Achat direct</n-radio>
              <n-radio value="credit">Achat à crédit</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="purchaseForm.type === 'credit'" label="Échéance" path="dueDate">
          <n-date-picker v-model:value="purchaseForm.dueDate" type="date" clearable style="width: 100%" />
        </n-form-item>
        <n-form-item label="Notes" path="notes">
          <n-input v-model:value="purchaseForm.notes" type="textarea" placeholder="Ajouter un commentaire" />
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

    <!-- Modale vente -->
    <n-modal
      v-model:show="showSaleModal"
      preset="card"
      title="Nouvelle vente E-Cards"
      :mask-closable="false"
      :style="{ width: '520px', maxWidth: '90%' }"
    >
      <n-form ref="saleFormRef" :model="saleForm" :rules="saleRules" label-placement="top">
        <n-form-item label="Type de client">
          <n-radio-group v-model:value="saleForm.clientMode">
            <n-space>
              <n-radio value="new">Nouveau client</n-radio>
              <n-radio value="existing">Client existant</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item
          v-if="saleForm.clientMode === 'existing'"
          label="Client"
          path="clientId"
        >
          <n-select
            v-model:value="saleForm.clientId"
            :options="clientOptions"
            filterable
            placeholder="Sélectionnez un client"
          />
        </n-form-item>
        <template v-else>
          <n-grid cols="1 m:2" :x-gap="12">
            <n-gi>
              <n-form-item label="Prénom client" path="clientFirstName">
                <n-input v-model:value="saleForm.clientFirstName" placeholder="Jean" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="Nom client" path="clientLastName">
                <n-input v-model:value="saleForm.clientLastName" placeholder="Dupont" />
              </n-form-item>
            </n-gi>
          </n-grid>
          <n-form-item label="Contact client" path="clientContact">
            <n-input v-model:value="saleForm.clientContact" placeholder="+225..." />
          </n-form-item>
        </template>
        <n-form-item label="Pays" path="country">
          <n-select
            v-model:value="saleForm.country"
            :options="countryOptions"
            filterable
            placeholder="Sélectionnez un pays"
          />
        </n-form-item>
        <n-grid cols="1 m:2" :x-gap="12">
          <n-gi>
            <n-form-item label="Montant" path="amount">
              <n-input-number v-model:value="saleForm.amount" min="0" placeholder="0" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Devise" path="currency">
              <n-input v-model:value="saleForm.currency" placeholder="USD" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="Date de vente" path="saleDate">
          <n-date-picker v-model:value="saleForm.saleDate" type="date" style="width: 100%" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button quaternary @click="closeSaleModal">Annuler</n-button>
          <n-button type="primary" :loading="submitting" @click="handleCreateSale">
            Valider
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Modale règlement -->
    <n-modal
      v-model:show="showPaymentModal"
      preset="card"
      title="Ajouter un règlement fournisseur"
      :mask-closable="false"
      :style="{ width: '520px', maxWidth: '90%' }"
    >
      <n-form ref="paymentFormRef" :model="paymentForm" :rules="paymentRules" label-placement="top">
        <n-form-item label="Fournisseur" path="supplierId">
          <n-select
            v-model:value="paymentForm.supplierId"
            :options="supplierOptions"
            filterable
            placeholder="Sélectionnez"
          />
        </n-form-item>
        <n-grid cols="1 m:2" :x-gap="12">
          <n-gi>
            <n-form-item label="Montant" path="amount">
              <n-input-number v-model:value="paymentForm.amount" min="0" placeholder="0" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Devise" path="currency">
              <n-input v-model:value="paymentForm.currency" placeholder="USD" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="Notes / référence" path="notes">
          <n-input v-model:value="paymentForm.notes" type="textarea" placeholder="Référence, mode de paiement..." />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button quaternary @click="closePaymentModal">Annuler</n-button>
          <n-button type="primary" :loading="submitting" @click="handleCreatePayment">
            Enregistrer le règlement
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue';
import { useMessage } from 'naive-ui';
import { eCardsApi } from '@/api/e-cards';
import { clientsApi } from '@/api/clients';
import { exportApi } from '@/api/export';
import { countriesApi } from '@/api/countries';
import { DocumentTextOutline } from '@vicons/ionicons5';
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui';

const message = useMessage();
const suppliers = ref<any[]>([]);
const purchases = ref<any[]>([]);
const sales = ref<any[]>([]);
const payments = ref<any[]>([]);
const clients = ref<any[]>([]);
const countries = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);

const showSupplierModal = ref(false);
const showPurchaseModal = ref(false);
const showSaleModal = ref(false);
const showPaymentModal = ref(false);

const paymentMethodOptions = [
  { label: 'Banque', value: 'Banque' },
  { label: 'Cash', value: 'Cash' },
  { label: 'Mobile Money', value: 'Mobile Money' },
];

const supplierColumns: DataTableColumns = [
  { title: 'Nom', key: 'name' },
  { title: 'Pays', key: 'country' },
  { title: 'Devise', key: 'currency' },
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
  { title: 'Type', key: 'type' },
  {
    title: 'Échéance',
    key: 'dueDate',
    render: (row: any) => (row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '—'),
  },
];

const saleColumns: DataTableColumns = [
  {
    title: 'Client',
    key: 'client',
    render: (row: any) =>
      `${row.clientFirstName || row.client?.firstName || ''} ${row.clientLastName || row.client?.lastName || ''}`.trim(),
  },
  { title: 'Contact', key: 'clientContact' },
  { title: 'Pays', key: 'country' },
  { title: 'Montant', key: 'amount' },
  { title: 'Devise', key: 'currency' },
  {
    title: 'Date de vente',
    key: 'saleDate',
    render: (row: any) => new Date(row.saleDate).toLocaleDateString(),
  },
];

const paymentColumns: DataTableColumns = [
  {
    title: 'Fournisseur',
    key: 'supplier',
    render: (row: any) => row.supplier?.name || '—',
  },
  { title: 'Montant', key: 'amount' },
  { title: 'Devise', key: 'currency' },
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

const clientOptions = computed(() =>
  clients.value.map((client) => ({
    label: `${client.firstName} ${client.lastName}`.trim(),
    value: client.id,
    contact: client.contact,
  })),
);

const supplierFormRef = ref<FormInst | null>(null);
const purchaseFormRef = ref<FormInst | null>(null);
const saleFormRef = ref<FormInst | null>(null);
const paymentFormRef = ref<FormInst | null>(null);

const supplierForm = reactive({
  name: '',
  country: '',
  paymentMethod: null as string | null,
  isActive: true,
});

const purchaseForm = reactive({
  supplierId: null as string | null,
  amount: null as number | null,
  rate: null as number | null,
  currency: 'USD',
  type: 'direct',
  dueDate: null as number | null,
  notes: '',
});

const saleForm = reactive({
  clientMode: 'new' as 'new' | 'existing',
  clientId: null as string | null,
  clientFirstName: '',
  clientLastName: '',
  clientContact: '',
  country: '',
  amount: null as number | null,
  currency: 'USD',
  saleDate: Date.now(),
});

const paymentForm = reactive({
  supplierId: null as string | null,
  amount: null as number | null,
  currency: 'USD',
  notes: '',
});

const supplierRules = {
  name: { required: true, message: 'Le nom est requis' },
  country: { required: true, message: 'Le pays est requis' },
  paymentMethod: { required: true, message: 'Sélectionnez un mode' },
};

const purchaseRules = {
  supplierId: { required: true, message: 'Fournisseur requis' },
  amount: { type: 'number', required: true, message: 'Montant requis' },
  rate: { type: 'number', required: true, message: 'Taux requis' },
  currency: { required: true, message: 'Devise requise' },
};

const saleRules: FormRules = {
  clientId: {
    validator: () => {
      if (saleForm.clientMode === 'existing' && !saleForm.clientId) {
        return new Error('Sélectionnez un client');
      }
      return true;
    },
    trigger: ['change', 'blur'],
  },
  clientFirstName: {
    validator: () => {
      if (saleForm.clientMode === 'new' && !saleForm.clientFirstName) {
        return new Error('Prénom requis');
      }
      return true;
    },
    trigger: ['blur', 'change'],
  },
  clientLastName: {
    validator: () => {
      if (saleForm.clientMode === 'new' && !saleForm.clientLastName) {
        return new Error('Nom requis');
      }
      return true;
    },
    trigger: ['blur', 'change'],
  },
  clientContact: {
    validator: () => {
      if (saleForm.clientMode === 'new' && !saleForm.clientContact) {
        return new Error('Contact requis');
      }
      return true;
    },
    trigger: ['blur', 'change'],
  },
  country: { required: true, message: 'Pays requis' },
  amount: { type: 'number', required: true, message: 'Montant requis' },
  saleDate: { type: 'number', required: true, message: 'Date requise' },
};

const paymentRules = {
  supplierId: { required: true, message: 'Fournisseur requis' },
  amount: { type: 'number', required: true, message: 'Montant requis' },
};

const resetForm = <T extends Record<string, any>>(form: T, initialValues: T) => {
  Object.keys(form).forEach((key) => {
    form[key as keyof T] = initialValues[key as keyof T];
  });
};

const loadData = async () => {
  loading.value = true;
  try {
    const [suppliersRes, purchasesRes, salesRes, paymentsRes, clientsRes, countriesRes] = await Promise.all([
      eCardsApi.suppliers.getAll(),
      eCardsApi.purchases.getAll(),
      eCardsApi.sales.getAll(),
      eCardsApi.payments.getAll(),
      clientsApi.getAll(),
      countriesApi.getAll(),
    ]);
    suppliers.value = suppliersRes.data || [];
    purchases.value = purchasesRes.data || [];
    sales.value = salesRes.data || [];
    payments.value = paymentsRes.data || [];
    clients.value = clientsRes.data || [];
    countries.value = countriesRes.data || [];
  } catch (error: any) {
    message.error(error?.message || 'Erreur lors du chargement des données E-Cards');
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
    type: 'direct',
    dueDate: null,
    notes: '',
  });
};

const closeSaleModal = () => {
  showSaleModal.value = false;
  saleFormRef.value?.restoreValidation();
  resetForm(saleForm, {
    clientMode: 'new',
    clientId: null,
    clientFirstName: '',
    clientLastName: '',
    clientContact: '',
    country: '',
    amount: null,
    currency: 'USD',
    saleDate: Date.now(),
  });
};

watch(
  () => saleForm.clientMode,
  (mode) => {
    if (mode === 'new') {
      saleForm.clientId = null;
      saleForm.clientFirstName = '';
      saleForm.clientLastName = '';
      saleForm.clientContact = '';
    }
  },
);

watch(
  () => saleForm.clientId,
  (id) => {
    if (saleForm.clientMode !== 'existing' || !id) {
      return;
    }
    const selected = clients.value.find((client) => client.id === id);
    if (selected) {
      saleForm.clientFirstName = selected.firstName;
      saleForm.clientLastName = selected.lastName;
      saleForm.clientContact = selected.contact;
    }
  },
);

const closePaymentModal = () => {
  showPaymentModal.value = false;
  paymentFormRef.value?.restoreValidation();
  resetForm(paymentForm, {
    supplierId: null,
    amount: null,
    currency: 'USD',
    notes: '',
  });
};

const handleCreateSupplier = async () => {
  try {
    await supplierFormRef.value?.validate();
    submitting.value = true;
    await eCardsApi.suppliers.create({ ...supplierForm });
    message.success('Fournisseur créé');
    closeSupplierModal();
    loadData();
  } catch (error: any) {
    message.error(error?.message || 'Impossible de créer le fournisseur');
  } finally {
    submitting.value = false;
  }
};

const handleCreatePurchase = async () => {
  try {
    await purchaseFormRef.value?.validate();
    submitting.value = true;
    await eCardsApi.purchases.create({
      ...purchaseForm,
      amount: Number(purchaseForm.amount),
      rate: Number(purchaseForm.rate),
      dueDate: purchaseForm.dueDate ? new Date(purchaseForm.dueDate).toISOString() : null,
    });
    message.success('Achat enregistré');
    closePurchaseModal();
    loadData();
  } catch (error: any) {
    message.error(error?.message || 'Impossible d’enregistrer l’achat');
  } finally {
    submitting.value = false;
  }
};

const handleCreateSale = async () => {
  try {
    await saleFormRef.value?.validate();
    submitting.value = true;
    let clientFirstName = saleForm.clientFirstName;
    let clientLastName = saleForm.clientLastName;
    let clientContact = saleForm.clientContact;

    if (saleForm.clientMode === 'existing' && saleForm.clientId) {
      const selected = clients.value.find((client) => client.id === saleForm.clientId);
      if (selected) {
        clientFirstName = selected.firstName;
        clientLastName = selected.lastName;
        clientContact = selected.contact;
      }
    }

    await eCardsApi.sales.create({
      country: saleForm.country,
      amount: Number(saleForm.amount),
      currency: saleForm.currency,
      saleDate: new Date(saleForm.saleDate).toISOString(),
      clientFirstName,
      clientLastName,
      clientContact,
      clientId: saleForm.clientMode === 'existing' ? saleForm.clientId : undefined,
    });
    message.success('Vente enregistrée');
    closeSaleModal();
    loadData();
  } catch (error: any) {
    message.error(error?.message || 'Impossible d’enregistrer la vente');
  } finally {
    submitting.value = false;
  }
};

const handleCreatePayment = async () => {
  try {
    await paymentFormRef.value?.validate();
    submitting.value = true;
    await eCardsApi.payments.create({
      ...paymentForm,
      amount: Number(paymentForm.amount),
    });
    message.success('Règlement enregistré');
    closePaymentModal();
    loadData();
  } catch (error: any) {
    message.error(error?.message || 'Impossible d’enregistrer le règlement');
  } finally {
    submitting.value = false;
  }
};

const handleExportSales = async (format: 'pdf' | 'xlsx') => {
  try {
    if (format === 'pdf') {
      await exportApi.eCardSales.pdf();
    } else {
      await exportApi.eCardSales.xlsx();
    }
    message.success(`Export ${format.toUpperCase()} téléchargé avec succès`);
  } catch (error: any) {
    message.error('Erreur lors de l\'export');
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
