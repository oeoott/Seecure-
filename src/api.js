// src/api.js (새로 생성하거나 기존 파일 확인)

import axios from 'axios';

// 백엔드 API 기본 URL (배포 시 변경 필요)
const BASE_URL = 'http://127.0.0.1:8000'; // 로컬 개발용. 실제 배포 시에는 서버의 주소로 변경

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 모든 요청에 JWT 토큰 추가 (인터셉터)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 로그인 페이지로 리다이렉트 (선택 사항)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 토큰 만료 또는 유효하지 않은 경우
      localStorage.removeItem('token'); // 저장된 토큰 삭제
      alert('세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
      window.location.href = '/login'; // 로그인 페이지로 리다이렉트 (SPA이므로 setPage 함수 사용이 더 적절할 수 있음)
    }
    return Promise.reject(error);
  }
);

export default api;