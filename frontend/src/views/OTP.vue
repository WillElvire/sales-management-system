<template>
  <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5;">
    <n-card style="width: 400px;">
      <template #header>Vérification OTP</template>
      <n-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleSubmit">
        <n-form-item path="otp" label="Code OTP">
          <n-input
            v-model:value="form.otp"
            placeholder="Entrez le code OTP reçu par email"
            maxlength="6"
            @keyup.enter="handleSubmit"
          />
        </n-form-item>
        <n-form-item>
          <n-button type="button" native-type="button" block :loading="loading" @click="handleSubmit">
            Vérifier
          </n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMessage } from 'naive-ui';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';
import type { FormInst } from 'naive-ui';

const router = useRouter();
const route = useRoute();
const message = useMessage();
const authStore = useAuthStore();
const formRef = ref<FormInst | null>(null);
const loading = ref(false);
const form = reactive({
  username: '',
  otp: '',
});

const rules = {
  otp: { required: true, message: 'Le code OTP est requis', trigger: 'blur' },
};

onMounted(() => {
  const username = route.query.username as string;
  if (!username) {
    router.push('/login');
  } else {
    form.username = username;
  }
});

const handleSubmit = async (e?: Event) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  try {
    await formRef.value?.validate();
    loading.value = true;
    const response = await authApi.verifyOtp(form);
    authStore.setAuth(response.data);
    message.success('Connexion réussie');
    router.push('/');
  } catch (error: any) {
    // S'assurer que l'erreur est bien gérée sans recharger la page
    const errorMessage = error?.response?.data?.message || error?.message || 'Code OTP invalide';
    message.error(errorMessage);
    console.error('OTP verification error:', error);
  } finally {
    loading.value = false;
  }
};
</script>

