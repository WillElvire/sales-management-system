import api from './axios';

export const reportsApi = {
  eCards: (startDate: string, endDate: string) => api.get('/reports/e-cards', { params: { startDate, endDate } }),
  usdt: (startDate: string, endDate: string) => api.get('/reports/usdt', { params: { startDate, endDate } }),
  cashCollect: (startDate: string, endDate: string) => api.get('/reports/cash-collect', { params: { startDate, endDate } }),
  finance: (startDate: string, endDate: string) => api.get('/reports/finance', { params: { startDate, endDate } }),
};

