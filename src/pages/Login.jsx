// src/pages/Login.jsx

import React, { useState } from 'react';
import logo from '../assets/logo_eye.png'; // Signin 페이지와 동일한 로고 사용
import api from '../api';

function Login({ setPage }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  // 백엔드와 연동된 로그인 기능은 그대로 유지합니다.
  const handleLogin = async () => {
    const formData = new FormData();
    formData.append('username', id);
    formData.append('password', password);

    try {
      const response = await api.post('/api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const token = response.data.access_token;
      if (token) {
        localStorage.setItem('token', token);
        setPage('Home');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert(error.response.data.detail);
      } else {
        alert('로그인 중 오류가 발생했습니다.');
        console.error('Login error:', error);
      }
    }
  };

  // --- 아래 return 안의 JSX 부분을 Signin.jsx 디자인에 맞춰 수정했습니다 ---
  return (
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
      {/* 로고 및 타이틀 (Signin.jsx와 동일한 스타일 적용) */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <img
          src={logo}
          alt="logo"
          style={{ width: 53, height: 33, marginRight: 8 }}
        />
        <div style={{ fontSize: 24, fontWeight: 600, color: '#1171C0' }}>See Cure</div>
      </div>

      {/* 로그인 안내 */}
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>로그인</h2>
      <p style={{ fontSize: 14, marginTop: 4, marginBottom: 20 }}>
        ID와 Password를 입력하세요.
      </p>

      {/* 로그인 폼 */}
      <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          placeholder="ID"
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
          style={{ color: '#1171C0', textDecoration: 'underline', cursor: 'pointer' }}
        >
          회원가입
        </span>
      </p>
    </div>
  );
}

export default Login;
