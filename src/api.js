// src/api.js
// Axios 인스턴스 설정: 기본 API URL, 토큰 헤더 주입, Content-Type 처리

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
});

// Request 인터셉터: 토큰/헤더 설정
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;

    const isFormData = (typeof FormData !== 'undefined') && (config.data instanceof FormData);
    const isUrlEncoded =
      (typeof URLSearchParams !== 'undefined') && (config.data instanceof URLSearchParams);

    // JSON 전송 시만 Content-Type 명시
    if (!isFormData && !isUrlEncoded) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
