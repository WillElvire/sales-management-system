<template>
  <div class="countries-page">
    <n-card class="glass-panel">
      <template #header>
        <div class="header">
          <div>
            <h2>Configuration des pays</h2>
            <p>Définissez codes, devises et régions pour l’ensemble des modules.</p>
          </div>
          <n-button type="primary" @click="openCreate">Nouveau pays</n-button>
        </div>
      </template>

      <n-data-table
        :columns="columns"
        :data="countries"
        :loading="loading"
        :bordered="false"
        :row-key="row => row.id"
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
        <n-form-item label="Nom du pays" path="name">
          <n-input v-model:value="form.name" placeholder="Ex: Côte d'Ivoire" />
        </n-form-item>
        <n-grid cols="1 m:2" :x-gap="12">
          <n-gi>
            <n-form-item label="Code (ISO)" path="code">
              <n-input v-model:value="form.code" placeholder="CI" maxlength="5" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Devise" path="currency">
              <n-input v-model:value="form.currency" placeholder="XOF" maxlength="5" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="Région" path="region">
          <n-input v-model:value="form.region" placeholder="Ex: Afrique de l'Ouest" />
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
import type { DataTableColumns, FormInst } from 'naive-ui';
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
} from 'naive-ui';
import { countriesApi, type Country, type CountryPayload } from '@/api/countries';

const message = useMessage();
const dialog = useDialog();

const countries = ref<Country[]>([]);
const loading = ref(false);
const submitting = ref(false);
const modalVisible = ref(false);
const modalTitle = ref('Nouveau pays');
const editingId = ref<string | null>(null);

const formRef = ref<FormInst | null>(null);
const form = reactive<CountryPayload>({
  name: '',
  code: '',
  currency: '',
  region: '',
  isActive: true,
});

const rules = {
  name: { required: true, message: 'Le nom est requis', trigger: 'blur' },
  code: { required: true, message: 'Le code est requis', trigger: 'blur' },
  currency: { required: true, message: 'La devise est requise', trigger: 'blur' },
};

const columns: DataTableColumns<Country> = [
  { title: 'Nom', key: 'name' },
  { title: 'Code', key: 'code' },
  { title: 'Devise', key: 'currency' },
  { title: 'Région', key: 'region' },
  {
    title: 'Statut',
    key: 'isActive',
    render: (row) =>
      h(
        NTag,
        { type: row.isActive ? 'success' : 'warning', bordered: false },
        { default: () => (row.isActive ? 'Actif' : 'Inactif') },
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
              { text: false, size: 'small', type: 'primary', onClick: () => openEdit(row) },
              { default: () => 'Modifier' },
            ),
            h(
              NButton,
              {
                text: false,
                type: 'error',
                size: 'small',
                onClick: () => confirmDelete(row),
              },
              { default: () => 'Supprimer' },
            ),
          ],
        },
      ),
  },
];

const loadCountries = async () => {
  loading.value = true;
  try {
    const { data } = await countriesApi.getAll();
    countries.value = data;
  } catch (error) {
    message.error("Impossible de charger les pays");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.name = '';
  form.code = '';
  form.currency = '';
  form.region = '';
  form.isActive = true;
};

const openCreate = () => {
  resetForm();
  editingId.value = null;
  modalTitle.value = 'Nouveau pays';
  modalVisible.value = true;
};

const openEdit = (country: Country) => {
  editingId.value = country.id;
  form.name = country.name;
  form.code = country.code;
  form.currency = country.currency;
  form.region = country.region || '';
  form.isActive = country.isActive;
  modalTitle.value = `Modifier ${country.name}`;
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
    const payload: CountryPayload = {
      name: form.name.trim(),
      code: form.code.toUpperCase(),
      currency: form.currency.toUpperCase(),
      region: form.region?.trim(),
      isActive: form.isActive,
    };
    if (editingId.value) {
      await countriesApi.update(editingId.value, payload);
      message.success('Pays mis à jour');
    } else {
      await countriesApi.create(payload);
      message.success('Pays créé');
    }
    closeModal();
    await loadCountries();
  } catch (error) {
    if (error) {
      message.error("Impossible d'enregistrer les informations");
    }
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (country: Country) => {
  dialog.warning({
    title: 'Suppression',
    content: `Supprimer ${country.name} ? Cette action est irréversible.`,
    positiveText: 'Supprimer',
    negativeText: 'Annuler',
    onPositiveClick: async () => {
      try {
        await countriesApi.remove(country.id);
        message.success('Pays supprimé');
        await loadCountries();
      } catch (error) {
        message.error("Impossible de supprimer le pays");
      }
    },
  });
};

onMounted(loadCountries);
</script>

<style scoped>
.countries-page {
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

