import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Cookie'leri her istekte gonder
});

// 401 redirect'i sadece /auth/me DISINDAKI istekler icin
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // /auth/me ve /auth/login icin redirect yapma — bunlar AuthContext tarafindan handle ediliyor
      const isAuthEndpoint = url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthEndpoint && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
