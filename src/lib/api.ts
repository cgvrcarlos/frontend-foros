import axios from 'axios';

// En producción Docker, usa el hostname del backend
// En desarrollo local, usa localhost
const getBaseURL = () => {
  // Si ya incluye /api, no agregar
  if (process.env.NEXT_PUBLIC_API_URL?.includes('/api')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${base}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          // Quitar /api del base si existe para llamar al endpoint correcto
          const baseURL = base.replace(/\/api$/, '');
          const { data } = await axios.post(`${baseURL}/api/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax`;
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api.request(error.config);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;