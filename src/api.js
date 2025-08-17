// src/api.js

import axios from 'axios';

// 백엔드 API 기본 URL
const BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
  // headers: { 'Content-Type': 'application/json' },
});

// 모든 요청에 JWT 토큰 추가 및 Content-Type 동적 설정 (인터셉터)
api.interceptors.request.use(
  (config) => {
    // 1. 로컬 스토리지에서 토큰을 가져옵니다.
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 2. 요청 데이터가 FormData인지 확인
    if (config.data instanceof FormData) {
    } else {
      // FormData가 아닐 때만 Content-Type을 'application/json'으로 설정
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      alert('세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
      // 필요에 따라 로그인 페이지로 이동하는 로직 추가
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
