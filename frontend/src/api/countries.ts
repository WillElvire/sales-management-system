import api from './axios';

export interface CountryPayload {
  name: string;
  code: string;
  currency: string;
  region?: string;
  isActive?: boolean;
}

export interface Country extends CountryPayload {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export const countriesApi = {
  getAll: () => api.get<Country[]>('/countries'),
  create: (data: CountryPayload) => api.post<Country>('/countries', data),
  update: (id: string, data: Partial<CountryPayload>) => api.patch<Country>(`/countries/${id}`, data),
  remove: (id: string) => api.delete(`/countries/${id}`),
};


