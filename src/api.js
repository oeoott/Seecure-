// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;

    const isFormData = (typeof FormData !== 'undefined') && (config.data instanceof FormData);
    const isUrlEncoded =
      (typeof URLSearchParams !== 'undefined') && (config.data instanceof URLSearchParams);

    // JSON 보낼 때만 Content-Type 지정 (URLSearchParams/FormData는 브라우저가 알아서 설정)
    if (!isFormData && !isUrlEncoded) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// (선택) Response interceptor: 401 시 로그인 페이지로 유도 등
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       // 토큰 만료 등 처리
//     }
//     return Promise.reject(err);
//   }
// );

export default api;
