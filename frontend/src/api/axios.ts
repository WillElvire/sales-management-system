import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Ne rediriger que si on n'est pas déjà sur la page de login
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', response.data.accessToken);
          error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api.request(error.config);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // Utiliser router au lieu de window.location pour éviter le rechargement
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else {
        // Utiliser router au lieu de window.location pour éviter le rechargement
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    // Pour toutes les autres erreurs (500, 400, etc.), simplement rejeter la promesse
    // Cela permettra au catch dans le composant de gérer l'erreur
    return Promise.reject(error);
  },
);

export default api;

