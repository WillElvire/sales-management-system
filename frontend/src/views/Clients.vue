<template>
  <div class="clients-page">
    <n-card class="glass-panel">
      <template #header>
        <div class="header">
          <div>
            <h2>Clients E-Cards</h2>
            <p>Historique des contacts associés aux ventes.</p>
          </div>
          <n-space>
            <n-input
              v-model:value="searchKeyword"
              placeholder="Rechercher un client"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
              style="min-width: 200px"
            />
            <n-button type="primary" @click="openCreate">Nouveau client</n-button>
          </n-space>
        </div>
      </template>

      <n-data-table
        :columns="columns"
        :data="clients"
        :loading="loading"
        :bordered="false"
        :row-key="(row) => row.id"
      />
    </n-card>

    <n-modal
      v-model:show="modalVisible"
      preset="card"
      :title="modalTitle"
      :style="{ width: '520px', maxWidth: '90%' }"
      :mask-closable="false"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <n-grid cols="1 m:2" :x-gap="12">
          <n-gi>
            <n-form-item label="Prénom" path="firstName">
              <n-input v-model:value="form.firstName" placeholder="Jean" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Nom" path="lastName">
              <n-input v-model:value="form.lastName" placeholder="Dupont" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="Contact" path="contact">
          <n-input v-model:value="form.contact" placeholder="+225 XX XX XX XX" />
        </n-form-item>
        <n-form-item label="Email" path="email">
          <n-input v-model:value="form.email" placeholder="client@email.com" />
        </n-form-item>
        <n-form-item label="Organisation" path="company">
          <n-input v-model:value="form.company" placeholder="Entreprise" />
        </n-form-item>
        <n-form-item label="Actif" path="isActive">
          <n-switch v-model:value="form.isActive" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button quaternary @click="closeModal">Annuler</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ editingId ? 'Enregistrer' : 'Créer' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import {
  NCard,
  NButton,
  NDataTable,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NSwitch,
  NGrid,
  NGi,
  useMessage,
  useDialog,
  type DataTableColumns,
  type FormInst,
} from 'naive-ui';
import { clientsApi, type Client, type ClientPayload } from '@/api/clients';

const message = useMessage();
const dialog = useDialog();

const clients = ref<Client[]>([]);
const loading = ref(false);
const submitting = ref(false);
const modalVisible = ref(false);
const modalTitle = ref('Nouveau client');
const editingId = ref<string | null>(null);
const searchKeyword = ref('');

const formRef = ref<FormInst | null>(null);
const form = reactive<ClientPayload>({
  firstName: '',
  lastName: '',
  contact: '',
  email: '',
  company: '',
  isActive: true,
});

const rules = {
  firstName: { required: true, message: 'Le prénom est requis', trigger: 'blur' },
  lastName: { required: true, message: 'Le nom est requis', trigger: 'blur' },
  contact: { required: true, message: 'Le contact est requis', trigger: 'blur' },
};

const columns: DataTableColumns<Client> = [
  {
    title: 'Client',
    key: 'fullName',
    render: (row) => `${row.firstName} ${row.lastName}`,
  },
  { title: 'Contact', key: 'contact' },
  { title: 'Email', key: 'email' },
  { title: 'Organisation', key: 'company' },
  {
    title: 'Statut',
    key: 'isActive',
    render: (row) =>
      h(NTag, { type: row.isActive ? 'success' : 'warning', bordered: false }, () =>
        row.isActive ? 'Actif' : 'Inactif',
      ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (row) =>
      h(
        NSpace,
        { size: 8 },
        {
          default: () => [
            h(
              NButton,
              { text: true, size: 'small', onClick: () => openEdit(row) },
              { default: () => 'Modifier' },
            ),
            h(
              NButton,
              { text: true, size: 'small', type: 'error', onClick: () => confirmDelete(row) },
              { default: () => 'Supprimer' },
            ),
          ],
        },
      ),
  },
];

const loadClients = async (keyword?: string) => {
  loading.value = true;
  try {
    const { data } = await clientsApi.getAll(keyword ? { keyword } : undefined);
    clients.value = data;
  } catch (error) {
    message.error('Impossible de charger les clients');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  loadClients(searchKeyword.value || undefined);
};

const resetForm = () => {
  form.firstName = '';
  form.lastName = '';
  form.contact = '';
  form.email = '';
  form.company = '';
  form.isActive = true;
};

const openCreate = () => {
  resetForm();
  editingId.value = null;
  modalTitle.value = 'Nouveau client';
  modalVisible.value = true;
};

const openEdit = (client: Client) => {
  editingId.value = client.id;
  form.firstName = client.firstName;
  form.lastName = client.lastName;
  form.contact = client.contact;
  form.email = client.email || '';
  form.company = client.company || '';
  form.isActive = client.isActive;
  modalTitle.value = `Modifier ${client.firstName}`;
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
  formRef.value?.restoreValidation();
  resetForm();
  editingId.value = null;
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;
    if (editingId.value) {
      await clientsApi.update(editingId.value, { ...form });
      message.success('Client mis à jour');
    } else {
      await clientsApi.create({ ...form });
      message.success('Client créé');
    }
    closeModal();
    await loadClients(searchKeyword.value || undefined);
  } catch (error) {
    message.error("Impossible d'enregistrer le client");
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (client: Client) => {
  dialog.warning({
    title: 'Suppression',
    content: `Supprimer ${client.firstName} ${client.lastName} ?`,
    positiveText: 'Supprimer',
    negativeText: 'Annuler',
    onPositiveClick: async () => {
      try {
        await clientsApi.remove(client.id);
        message.success('Client supprimé');
        await loadClients(searchKeyword.value || undefined);
      } catch (error) {
        message.error("Impossible de supprimer ce client");
      }
    },
  });
};

onMounted(() => loadClients());
</script>

<style scoped>
.clients-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.glass-panel {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  border: 1px solid rgba(16, 185, 129, 0.12);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.header h2 {
  margin: 0;
  color: #0f172a;
}

.header p {
  margin: 4px 0 0;
  color: rgba(15, 23, 42, 0.65);
}
</style>

