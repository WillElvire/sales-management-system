import api from './axios';

export const cashCollectApi = {
  agents: {
    getAll: () => api.get('/cash-collect/agents'),
    getOne: (id: string) => api.get(`/cash-collect/agents/${id}`),
    getBalance: (id: string) => api.get(`/cash-collect/agents/${id}/balance`),
    create: (data: any) => api.post('/cash-collect/agents', data),
  },
  transactions: {
    getAll: (params?: { startDate?: string; endDate?: string; country?: string; currency?: string }) => api.get('/cash-collect/transactions', { params }),
    create: (data: any) => api.post('/cash-collect/transactions', data),
  },
  balance: {
    byCurrency: (currency: string) => api.get(`/cash-collect/balance/currency/${currency}`),
    byCorridor: (id: string) => api.get(`/cash-collect/balance/corridor/${id}`),
  },
};

