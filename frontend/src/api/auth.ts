import api from './axios';

export interface LoginDto {
  username: string;
  password: string;
}

export interface VerifyOtpDto {
  username: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    phone: string;
    roles: string[];
  };
}

export const authApi = {
  login: (data: LoginDto) => api.post('/auth/login', data),
  verifyOtp: (data: VerifyOtpDto) => api.post<AuthResponse>('/auth/verify-otp', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

