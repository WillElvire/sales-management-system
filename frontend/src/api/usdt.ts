import api from './axios';

export const usdtApi = {
  suppliers: {
    getAll: () => api.get('/usdt/suppliers'),
    getOne: (id: string) => api.get(`/usdt/suppliers/${id}`),
    getBalance: (id: string) => api.get(`/usdt/suppliers/${id}/balance`),
    create: (data: any) => api.post('/usdt/suppliers', data),
  },
  purchases: {
    getAll: (params?: { startDate?: string; endDate?: string; country?: string }) => api.get('/usdt/purchases', { params }),
    create: (data: any) => api.post('/usdt/purchases', data),
  },
  accounts: {
    getAll: () => api.get('/usdt/accounts'),
    create: (data: any) => api.post('/usdt/accounts', data),
    activate: (id: string) => api.post(`/usdt/accounts/${id}/activate`),
    deactivate: (id: string) => api.post(`/usdt/accounts/${id}/deactivate`),
  },
};

