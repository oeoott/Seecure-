// src/pages/Login.jsx
// 로그인 페이지: 사용자 인증 후 토큰 저장 및 Home 페이지로 이동

import React, { useState } from 'react';
import logo from '../assets/logo_eye.png';
import api from '../api';

function Login({ setPage }) {
  const [id, setId] = useState('');          // 사용자 ID
  const [password, setPassword] = useState(''); // 비밀번호

  // 로그인 처리
  const handleLogin = async () => {
    const form = new URLSearchParams();
    form.append('username', id);
    form.append('password', password);

    try {
      const response = await api.post('/api/v1/auth/login', form);
      const token = response.data.access_token;
      if (token) {
        localStorage.setItem('token', token); // 토큰 저장
        setPage('Home'); // 로그인 성공 시 홈으로 이동
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert(error.response.data.detail); // 인증 실패
      } else {
        alert('로그인 중 오류가 발생했습니다.');
        console.error('Login error:', error);
      }
    }
  };

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
      {/* 로고 & 타이틀 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <img src={logo} alt="logo" style={{ width: 53, height: 33, marginRight: 8 }} />
        <div style={{ fontSize: 24, fontWeight: 600, color: '#1171C0' }}>See Cure</div>
      </div>

      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>로그인</h2>
      <p style={{ fontSize: 14, marginTop: 4, marginBottom: 20 }}>ID와 Password를 입력하세요.</p>

      {/* 입력 폼 */}
      <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          placeholder="ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{ height: 40, padding: '0 12px', borderRadius: 6, border: '1px solid #E0E0E0', fontSize: 14 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ height: 40, padding: '0 12px', borderRadius: 6, border: '1px solid #E0E0E0', fontSize: 14 }}
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
