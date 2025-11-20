import api from './axios';

export const monitoringApi = {
  eCards: (startDate: string, endDate: string) => api.get('/monitoring/e-cards', { params: { startDate, endDate } }),
  usdt: (startDate: string, endDate: string, country?: string) => api.get('/monitoring/usdt', { params: { startDate, endDate, country } }),
  cashCollect: (startDate: string, endDate: string, country?: string) => api.get('/monitoring/cash-collect', { params: { startDate, endDate, country } }),
};

