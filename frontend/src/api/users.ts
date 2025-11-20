import api from './axios';

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  status: string;
  roles: Array<{ name: string }>;
}

export interface CreateUserDto {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  status?: string;
  roleNames?: string[];
}

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getOne: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserDto) => api.post('/users', data),
  update: (id: string, data: Partial<CreateUserDto>) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  resetPassword: (id: string, newPassword: string) => api.post(`/users/${id}/reset-password`, { newPassword }),
  lock: (id: string) => api.post(`/users/${id}/lock`),
  unlock: (id: string) => api.post(`/users/${id}/unlock`),
  activate: (id: string) => api.post(`/users/${id}/activate`),
  deactivate: (id: string) => api.post(`/users/${id}/deactivate`),
};

