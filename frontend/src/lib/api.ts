import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('wally_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to unwrap data and handle token expiration
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('wally_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
          const newAccessToken = res.data.data.accessToken;
          const newRefreshToken = res.data.data.refreshToken;

          localStorage.setItem('wally_access_token', newAccessToken);
          localStorage.setItem('wally_refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('wally_access_token');
          localStorage.removeItem('wally_refresh_token');
          localStorage.removeItem('wally_user');
        }
      }
    }

    return Promise.reject(error.response?.data || error);
  },
);
