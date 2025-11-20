import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authApi, type AuthResponse } from '@/api/auth';

const LOCAL_USER_KEY = 'auth_user';

export const useAuthStore = defineStore('auth', () => {
  const persistedUser = localStorage.getItem(LOCAL_USER_KEY);
  const user = ref<AuthResponse['user'] | null>(
    persistedUser ? JSON.parse(persistedUser) : null,
  );
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const loadingSession = ref(false);

  const persistUser = (currentUser: AuthResponse['user'] | null) => {
    if (currentUser) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  };

  const setAuth = (data: AuthResponse) => {
    user.value = data.user;
    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;
    persistUser(data.user);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  };

  const normalizeUser = (rawUser: any): AuthResponse['user'] => {
    if (!rawUser) {
      throw new Error('Utilisateur invalide');
    }
    const roles =
      rawUser.roles?.map((role: any) => (typeof role === 'string' ? role : role?.name)) || [];
    return {
      id: rawUser.id,
      username: rawUser.username,
      email: rawUser.email,
      phone: rawUser.phone,
      roles,
    };
  };

  const restoreSession = async () => {
    if (loadingSession.value || user.value || !accessToken.value) {
      return;
    }
    loadingSession.value = true;
    try {
      const { data } = await authApi.me();
      const normalized = normalizeUser(data);
      user.value = normalized;
      persistUser(normalized);
    } catch (error) {
      logout();
      throw error;
    } finally {
      loadingSession.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    persistUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const hasRole = (role: string) => {
    return user.value?.roles.includes(role) || false;
  };

  const isAuthenticated = () => {
    return !!accessToken.value && !!user.value;
  };

  return {
    user,
    accessToken,
    refreshToken,
    loadingSession,
    setAuth,
    restoreSession,
    normalizeUser,
    logout,
    hasRole,
    isAuthenticated,
  };
});

