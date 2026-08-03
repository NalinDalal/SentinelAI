import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function createClient(baseURL: string = '/api') {
  const client: AxiosInstance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError<ApiResponse<unknown>>) => {
      const message = error.response?.data?.message || error.message;
      console.error('API Error:', message);
      return Promise.reject(error);
    },
  );

  return client;
}