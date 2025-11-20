<template>
  <div class="login-wrapper">
    <div class="login-panel">
      <div class="login-hero">
        <span class="login-badge">Backoffice sécurisé</span>
        <h1>Bienvenue sur la plateforme Sales Management</h1>
        <p>
          Suivez les volumes E-Cards, USDT et Cash Collect en temps réel depuis un seul espace,
          avec des contrôles d’accès granulaires.
        </p>
        <div class="hero-highlights">
          <div class="highlight-card">
            <strong>Monitoring</strong>
            <span>Pays & fournisseurs</span>
          </div>
          <div class="highlight-card">
            <strong>OTP & JWT</strong>
            <span>Connexion sécurisée</span>
          </div>
          <div class="highlight-card">
            <strong>Dashboards</strong>
            <span>Vue hebdo</span>
          </div>
        </div>
      </div>

      <n-card class="login-card" :bordered="false">
        <div class="card-header">
          <div class="icon-wrapper">
            <n-icon size="26">
              <LockClosedOutline />
            </n-icon>
          </div>
          <div>
            <h2>Connexion</h2>
            <p>Accédez à votre espace en toute sécurité</p>
          </div>
        </div>

        <n-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleSubmit" class="login-form">
          <n-form-item path="username" label="Nom d'utilisateur">
            <n-input
              v-model:value="form.username"
              placeholder="Nom d'utilisateur"
              size="large"
              @keyup.enter="handleSubmit"
            />
          </n-form-item>
          <n-form-item path="password" label="Mot de passe">
            <n-input
              v-model:value="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mot de passe"
              size="large"
              @keyup.enter="handleSubmit"
            >
              <template #suffix>
                <n-tooltip placement="top">
                  <template #trigger>
                    <n-button
                      quaternary
                      text
                      type="primary"
                      class="password-toggle"
                      @click.prevent="togglePassword"
                    >
                      <n-icon size="18">
                        <EyeOffOutline v-if="showPassword" />
                        <EyeOutline v-else />
                      </n-icon>
                    </n-button>
                  </template>
                  <span>{{ showPassword ? 'Masquer' : 'Afficher' }} le mot de passe</span>
                </n-tooltip>
              </template>
            </n-input>
          </n-form-item>

          <div class="login-hint">
            <span>Besoin d'aide ? Contactez le support Head Office.</span>
          </div>

          <n-button
            class="login-button"
            type="primary"
            size="large"
            native-type="submit"
            block
            :loading="loading"
            @click="handleSubmit"
          >
            Se connecter
          </n-button>
        </n-form>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { authApi } from '@/api/auth';
import type { FormInst } from 'naive-ui';
import { LockClosedOutline, EyeOutline, EyeOffOutline } from '@vicons/ionicons5';

const router = useRouter();
const message = useMessage();
const formRef = ref<FormInst | null>(null);
const loading = ref(false);
const form = reactive({
  username: '',
  password: '',
});
const showPassword = ref(false);

const rules = {
  username: { required: true, message: 'Le nom d\'utilisateur est requis', trigger: 'blur' },
  password: { required: true, message: 'Le mot de passe est requis', trigger: 'blur' },
};

const handleSubmit = async (e?: Event) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  try {
    await formRef.value?.validate();
    loading.value = true;
    const response = await authApi.login(form);
    message.success('Code OTP envoyé à votre email');
    router.push({ name: 'OTP', query: { username: form.username } });
  } catch (error: any) {
    // S'assurer que l'erreur est bien gérée sans recharger la page
    const errorMessage = error?.response?.data?.message || error?.message || 'Erreur de connexion';
    message.error(errorMessage);
    console.error('Login error:', error);
  } finally {
    loading.value = false;
  }
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  background: #f8fbf9;
  color: #0f172a;
}

.login-panel {
  width: 100%;
  max-width: 1080px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  align-items: stretch;
}

.login-hero {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.login-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #0f5132;
}

.login-hero h1 {
  margin-top: 18px;
  font-size: 32px;
  line-height: 1.2;
  color: #0f172a;
}

.login-hero p {
  margin: 12px 0 24px;
  color: rgba(15, 23, 42, 0.75);
  line-height: 1.6;
}

.hero-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.highlight-card {
  padding: 16px;
  border-radius: 18px;
  background: rgba(249, 250, 251, 0.9);
  border: 1px solid rgba(16, 185, 129, 0.12);
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #0f172a;
}

.highlight-card strong {
  font-size: 16px;
}

.highlight-card span {
  font-size: 13px;
  color: rgba(15, 23, 42, 0.65);
}

.login-card {
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.card-header h2 {
  margin: 0;
  color: #0f172a;
}

.card-header p {
  margin: 4px 0 0;
  color: rgba(15, 23, 42, 0.6);
}

.icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0f5132, #22c55e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 15px 30px rgba(16, 185, 129, 0.3);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-hint {
  font-size: 13px;
  color: rgba(15, 23, 42, 0.6);
  margin: 12px 0 4px;
}

.login-button {
  margin-top: 4px;
  height: 48px;
  font-weight: 600;
  letter-spacing: 0.3px;
  background: linear-gradient(135deg, #0f5132, #22c55e);
  border: none;
  color: #fff;
}

.password-toggle {
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .login-wrapper {
    padding: 24px 16px;
  }

  .login-panel {
    grid-template-columns: 1fr;
  }
}
</style>

