import api from './axios';

export const eCardsApi = {
  suppliers: {
    getAll: () => api.get('/e-cards/suppliers'),
    getOne: (id: string) => api.get(`/e-cards/suppliers/${id}`),
    getBalance: (id: string) => api.get(`/e-cards/suppliers/${id}/balance`),
    create: (data: any) => api.post('/e-cards/suppliers', data),
  },
  purchases: {
    getAll: (params?: { startDate?: string; endDate?: string }) => api.get('/e-cards/purchases', { params }),
    create: (data: any) => api.post('/e-cards/purchases', data),
  },
  sales: {
    getAll: (params?: { startDate?: string; endDate?: string }) => api.get('/e-cards/sales', { params }),
    create: (data: any) => api.post('/e-cards/sales', data),
  },
  payments: {
    getAll: () => api.get('/e-cards/payments'),
    create: (data: any) => api.post('/e-cards/payments', data),
  },
};

