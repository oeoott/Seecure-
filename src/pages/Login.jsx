// src/pages/Login.jsx (선택적 수정 - api.js 사용하도록 통일)

import React, { useState } from 'react';
import logo from '../assets/logo_eye.png';
// import axios from 'axios'; // axios 직접 임포트 대신 api 모듈 사용 권장
import api from '../api'; // api 모듈 임포트

// 백엔드 API 기본 URL은 api.js에서 관리 (여기서는 삭제)
// const API_URL = 'http://127.0.0.1:8000'; 

function Login({ setPage }) {
  const [id, setId] = useState(''); // 백엔드 스키마상 'email'
  const [password, setPassword] = useState('');

  // 로그인 로직 (API 연동)
  const handleLogin = async () => {
    // 백엔드의 로그인 API는 Form 데이터를 요구함
    const formData = new FormData();
    formData.append('username', id); // 'username' 필드에 id(이메일)를 담음
    formData.append('password', password);

    try {
      // api 모듈을 통해 로그인 요청 (headers 설정은 api.js에서 처리)
      const response = await api.post('/api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // 로그인 성공 시 토큰을 localStorage에 저장
      const token = response.data.access_token;
      if (token) {
        localStorage.setItem('token', token);
        setPage('Home'); // 홈 페이지로 이동
      }

    } catch (error) {
      if (error.response && error.response.status === 401) {
        // 백엔드에서 보낸 에러 메시지 사용
        alert(error.response.data.detail);
      } else {
        alert('로그인 중 오류가 발생했습니다.');
        console.error('Login error:', error);
      }
    }
  };

  return (
    // ... 기존 JSX 코드 (디자인 변경 없음)
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        color: '#054071',
      }}
    >
      {/* 로고 및 타이틀 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
        <img
          src={logo}
          alt="logo"
          style={{ width: 50, height: 30, marginRight: 8 }}
        />
        <div style={{ fontSize: 32, fontWeight: 600, color: '#1171C0' }}>See Cure</div>
      </div>

      <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email" // type을 email로 변경
          placeholder="ID (Email)"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{
            height: 40,
            padding: '0 12px',
            borderRadius: 6,
            border: '1px solid #E0E0E0',
            fontSize: 14,
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            height: 40,
            padding: '0 12px',
            borderRadius: 6,
            border: '1px solid #E0E0E0',
            fontSize: 14,
          }}
        />
        <button
          onClick={handleLogin}
          style={{
            height: 40,
            backgroundColor: '#1171C0',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </div>

      {/* 회원가입 링크 */}
      <p style={{ fontSize: 14, marginTop: 20 }}>
        아직 계정이 없으신가요?{' '}
        <span
          onClick={() => setPage('signin')}
          style={{ color: '#1171C0', cursor: 'pointer', fontWeight: 500 }}
        >
          회원가입
        </span>
      </p>
    </div>
  );
}

export default Login;