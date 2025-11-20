import api from './axios';

export interface ClientPayload {
  firstName: string;
  lastName: string;
  contact: string;
  email?: string;
  company?: string;
  isActive?: boolean;
}

export interface Client extends ClientPayload {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export const clientsApi = {
  getAll: (params?: { keyword?: string }) => api.get<Client[]>('/clients', { params }),
  create: (data: ClientPayload) => api.post<Client>('/clients', data),
  update: (id: string, data: Partial<ClientPayload>) => api.patch<Client>(`/clients/${id}`, data),
  remove: (id: string) => api.delete(`/clients/${id}`),
};

