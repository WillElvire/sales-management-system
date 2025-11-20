<template>
  <div class="module-page">
    <n-card>
      <template #header>
        <div class="card-header">
          <div>
            <h3>Gestion des Utilisateurs</h3>
            <p>Création, modification et gestion des comptes utilisateurs</p>
          </div>
          <n-button type="primary" @click="showCreateModal = true">
            <template #icon>
              <n-icon><PersonAddOutline /></n-icon>
            </template>
            Créer un utilisateur
          </n-button>
        </div>
      </template>
      <n-data-table
        :columns="columns"
        :data="users"
        :loading="loading"
        :pagination="pagination"
      />
    </n-card>

    <!-- Modal création -->
    <n-modal
      v-model:show="showCreateModal"
      preset="card"
      title="Créer un utilisateur"
      :mask-closable="false"
      :style="{ width: '600px', maxWidth: '95%' }"
    >
      <n-form ref="createFormRef" :model="createForm" :rules="createRules" label-placement="top">
        <n-form-item label="Nom d'utilisateur" path="username">
          <n-input v-model:value="createForm.username" placeholder="john.doe" />
        </n-form-item>
        <n-form-item label="Mot de passe" path="password">
          <n-input v-model:value="createForm.password" type="password" show-password-on="click" placeholder="••••••••" />
        </n-form-item>
        <n-grid cols="1 m:2" :x-gap="12">
          <n-gi>
            <n-form-item label="Email" path="email">
              <n-input v-model:value="createForm.email" placeholder="john@example.com" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Téléphone" path="phone">
              <n-input v-model:value="createForm.phone" placeholder="+225..." />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="Rôles" path="roleNames">
          <n-select
            v-model:value="createForm.roleNames"
            :options="roleOptions"
            multiple
            placeholder="Sélectionnez les rôles"
          />
        </n-form-item>
        <n-form-item label="Statut" path="status">
          <n-select
            v-model:value="createForm.status"
            :options="statusOptions"
            placeholder="Sélectionnez le statut"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button quaternary @click="closeCreateModal">Annuler</n-button>
          <n-button type="primary" :loading="submitting" @click="handleCreate">Créer</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Modal édition -->
    <n-modal
      v-model:show="showEditModal"
      preset="card"
      title="Modifier l'utilisateur"
      :mask-closable="false"
      :style="{ width: '600px', maxWidth: '95%' }"
    >
      <n-form ref="editFormRef" :model="editForm" :rules="editRules" label-placement="top">
        <n-form-item label="Nom d'utilisateur" path="username">
          <n-input v-model:value="editForm.username" placeholder="john.doe" />
        </n-form-item>
        <n-grid cols="1 m:2" :x-gap="12">
          <n-gi>
            <n-form-item label="Email" path="email">
              <n-input v-model:value="editForm.email" placeholder="john@example.com" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Téléphone" path="phone">
              <n-input v-model:value="editForm.phone" placeholder="+225..." />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="Rôles" path="roleNames">
          <n-select
            v-model:value="editForm.roleNames"
            :options="roleOptions"
            multiple
            placeholder="Sélectionnez les rôles"
          />
        </n-form-item>
        <n-form-item label="Statut" path="status">
          <n-select
            v-model:value="editForm.status"
            :options="statusOptions"
            placeholder="Sélectionnez le statut"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button quaternary @click="closeEditModal">Annuler</n-button>
          <n-button type="primary" :loading="submitting" @click="handleUpdate">Enregistrer</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Modal changement mot de passe -->
    <n-modal
      v-model:show="showPasswordModal"
      preset="card"
      title="Changer le mot de passe"
      :mask-closable="false"
      :style="{ width: '500px', maxWidth: '95%' }"
    >
      <n-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-placement="top">
        <n-form-item label="Nouveau mot de passe" path="newPassword">
          <n-input v-model:value="passwordForm.newPassword" type="password" show-password-on="click" placeholder="••••••••" />
        </n-form-item>
        <n-form-item label="Confirmer le mot de passe" path="confirmPassword">
          <n-input v-model:value="passwordForm.confirmPassword" type="password" show-password-on="click" placeholder="••••••••" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button quaternary @click="closePasswordModal">Annuler</n-button>
          <n-button type="primary" :loading="submitting" @click="handleResetPassword">Changer</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue';
import { 
  useMessage,
  NButton,
  NDropdown,
  NIcon,
  NTag,
} from 'naive-ui';
import { usersApi, type User } from '@/api/users';
import { PersonAddOutline, LockClosedOutline, LockOpenOutline, CheckmarkCircleOutline, CloseCircleOutline, PencilOutline, TrashOutline, KeyOutline, EllipsisHorizontalOutline } from '@vicons/ionicons5';
import type { DataTableColumns, FormInst, FormRules, DropdownOption } from 'naive-ui';

const message = useMessage();
const users = ref<User[]>([]);
const loading = ref(false);
const submitting = ref(false);
const selectedUser = ref<User | null>(null);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showPasswordModal = ref(false);

const createFormRef = ref<FormInst | null>(null);
const editFormRef = ref<FormInst | null>(null);
const passwordFormRef = ref<FormInst | null>(null);

const roleOptions = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Comptable', value: 'Comptable' },
  { label: 'Agent Collect', value: 'AgentCollect' },
];

const statusOptions = [
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
  { label: 'Bloqué', value: 'locked' },
];

const createForm = reactive({
  username: '',
  password: '',
  email: '',
  phone: '',
  roleNames: [] as string[],
  status: 'active',
});

const editForm = reactive({
  id: '',
  username: '',
  email: '',
  phone: '',
  roleNames: [] as string[],
  status: 'active',
});

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: '',
});

const createRules: FormRules = {
  username: { required: true, message: 'Nom d\'utilisateur requis' },
  password: [
    { required: true, message: 'Mot de passe requis' },
    { min: 6, message: 'Minimum 6 caractères' },
  ],
  email: { type: 'email', message: 'Email invalide' },
};

const editRules: FormRules = {
  username: { required: true, message: 'Nom d\'utilisateur requis' },
  email: { type: 'email', message: 'Email invalide' },
};

const passwordRules: FormRules = {
  newPassword: [
    { required: true, message: 'Mot de passe requis' },
    { min: 6, message: 'Minimum 6 caractères' },
  ],
  confirmPassword: {
    required: true,
    validator: (_rule, value) => {
      if (value !== passwordForm.newPassword) {
        return new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    },
    trigger: ['input', 'blur'],
  },
};

const pagination = {
  pageSize: 10,
};

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { type: 'success' | 'warning' | 'error'; label: string }> = {
    active: { type: 'success', label: 'Actif' },
    inactive: { type: 'warning', label: 'Inactif' },
    locked: { type: 'error', label: 'Bloqué' },
  };
  return statusMap[status] || { type: 'default', label: status };
};

const getActionOptions = (user: User): DropdownOption[] => {
  const options: DropdownOption[] = [
    {
      label: 'Modifier',
      key: 'edit',
      icon: () => h(NIcon, null, { default: () => h(PencilOutline) }),
    },
    {
      label: 'Changer mot de passe',
      key: 'password',
      icon: () => h(NIcon, null, { default: () => h(KeyOutline) }),
    },
    {
      type: 'divider',
      key: 'divider1',
    },
  ];

  if (user.status === 'active') {
    options.push({
      label: 'Désactiver',
      key: 'deactivate',
      icon: () => h(NIcon, null, { default: () => h(CloseCircleOutline) }),
    });
    options.push({
      label: 'Bloquer',
      key: 'lock',
      icon: () => h(NIcon, null, { default: () => h(LockClosedOutline) }),
    });
  } else if (user.status === 'inactive') {
    options.push({
      label: 'Activer',
      key: 'activate',
      icon: () => h(NIcon, null, { default: () => h(CheckmarkCircleOutline) }),
    });
    options.push({
      label: 'Bloquer',
      key: 'lock',
      icon: () => h(NIcon, null, { default: () => h(LockClosedOutline) }),
    });
  } else if (user.status === 'locked') {
    options.push({
      label: 'Débloquer',
      key: 'unlock',
      icon: () => h(NIcon, null, { default: () => h(LockOpenOutline) }),
    });
    options.push({
      label: 'Activer',
      key: 'activate',
      icon: () => h(NIcon, null, { default: () => h(CheckmarkCircleOutline) }),
    });
  }

  options.push({
    type: 'divider',
    key: 'divider2',
  });

  options.push({
    label: 'Supprimer',
    key: 'delete',
    icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
  });

  return options;
};

const handleActionSelect = (key: string, user: User) => {
  switch (key) {
    case 'edit':
      handleEdit(user);
      break;
    case 'password':
      handleOpenPasswordModal(user);
      break;
    case 'activate':
      handleActivate(user);
      break;
    case 'deactivate':
      handleDeactivate(user);
      break;
    case 'lock':
      handleLock(user);
      break;
    case 'unlock':
      handleUnlock(user);
      break;
    case 'delete':
      handleDelete(user);
      break;
  }
};

const columns: DataTableColumns<User> = [
  { title: 'Nom d\'utilisateur', key: 'username' },
  { title: 'Email', key: 'email' },
  { title: 'Téléphone', key: 'phone' },
  {
    title: 'Rôles',
    key: 'roles',
    render: (row) => {
      if (!row.roles || row.roles.length === 0) {
        return h('span', { style: 'color: #999' }, 'Aucun rôle');
      }
      return h(
        'div',
        { style: 'display: flex; gap: 4px; flex-wrap: wrap' },
        row.roles.map((role: any) =>
          h(NTag, { type: 'info', size: 'small' }, { default: () => role.name }),
        ),
      );
    },
  },
  {
    title: 'Statut',
    key: 'status',
    render: (row) => {
      const status = getStatusTag(row.status);
      return h(NTag, { type: status.type, size: 'small' }, { default: () => status.label });
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    render: (row) => {
      return h(
        NDropdown,
        {
          trigger: 'click',
          options: getActionOptions(row),
          onSelect: (key: string) => handleActionSelect(key, row),
        },
        {
          default: () => h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              secondary: true,
              style: { 
                minWidth: '60px',
              },
            },
            {
              default: () => 'Actions',
              icon: () => h(NIcon, null, { default: () => h(EllipsisHorizontalOutline) }),
            },
          ),
        },
      );
    },
  },
];

const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await usersApi.getAll();
    users.value = response.data;
  } catch (error: any) {
    message.error(error?.message || 'Erreur lors du chargement des utilisateurs');
  } finally {
    loading.value = false;
  }
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  createFormRef.value?.restoreValidation();
  Object.assign(createForm, {
    username: '',
    password: '',
    email: '',
    phone: '',
    roleNames: [],
    status: 'active',
  });
};

const closeEditModal = () => {
  showEditModal.value = false;
  editFormRef.value?.restoreValidation();
  selectedUser.value = null;
};

const closePasswordModal = () => {
  showPasswordModal.value = false;
  passwordFormRef.value?.restoreValidation();
  Object.assign(passwordForm, {
    newPassword: '',
    confirmPassword: '',
  });
  selectedUser.value = null;
};

const handleCreate = async () => {
  try {
    await createFormRef.value?.validate();
    submitting.value = true;
    await usersApi.create(createForm);
    message.success('Utilisateur créé avec succès');
    closeCreateModal();
    loadUsers();
  } catch (error: any) {
    message.error(error?.message || 'Erreur lors de la création');
  } finally {
    submitting.value = false;
  }
};

const handleEdit = (user: User) => {
  selectedUser.value = user;
  Object.assign(editForm, {
    id: user.id,
    username: user.username,
    email: user.email || '',
    phone: user.phone || '',
    roleNames: user.roles?.map((r: any) => r.name) || [],
    status: user.status,
  });
  showEditModal.value = true;
};

const handleUpdate = async () => {
  try {
    await editFormRef.value?.validate();
    submitting.value = true;
    await usersApi.update(editForm.id, {
      username: editForm.username,
      email: editForm.email,
      phone: editForm.phone,
      roleNames: editForm.roleNames,
      status: editForm.status,
    });
    message.success('Utilisateur modifié avec succès');
    closeEditModal();
    loadUsers();
  } catch (error: any) {
    message.error(error?.message || 'Erreur lors de la modification');
  } finally {
    submitting.value = false;
  }
};

const handleOpenPasswordModal = (user: User) => {
  selectedUser.value = user;
  showPasswordModal.value = true;
};

const handleResetPassword = async () => {
  try {
    await passwordFormRef.value?.validate();
    if (!selectedUser.value) return;
    submitting.value = true;
    await usersApi.resetPassword(selectedUser.value.id, passwordForm.newPassword);
    message.success('Mot de passe modifié avec succès');
    closePasswordModal();
  } catch (error: any) {
    message.error(error?.message || 'Erreur lors du changement de mot de passe');
  } finally {
    submitting.value = false;
  }
};

const handleActivate = async (user: User) => {
  try {
    await usersApi.activate(user.id);
    message.success('Utilisateur activé');
    loadUsers();
  } catch (error: any) {
    message.error(error?.message || 'Erreur');
  }
};

const handleDeactivate = async (user: User) => {
  try {
    await usersApi.deactivate(user.id);
    message.success('Utilisateur désactivé');
    loadUsers();
  } catch (error: any) {
    message.error(error?.message || 'Erreur');
  }
};

const handleLock = async (user: User) => {
  try {
    await usersApi.lock(user.id);
    message.success('Compte verrouillé');
    loadUsers();
  } catch (error: any) {
    message.error(error?.message || 'Erreur');
  }
};

const handleUnlock = async (user: User) => {
  try {
    await usersApi.unlock(user.id);
    message.success('Compte déverrouillé');
    loadUsers();
  } catch (error: any) {
    message.error(error?.message || 'Erreur');
  }
};

const handleDelete = async (user: User) => {
  try {
    await usersApi.delete(user.id);
    message.success('Utilisateur supprimé');
    loadUsers();
  } catch (error: any) {
    message.error(error?.message || 'Erreur lors de la suppression');
  }
};

onMounted(() => {
  loadUsers();
});
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
