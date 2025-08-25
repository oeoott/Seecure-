// src/pages/Signin.jsx
// 회원가입 페이지: 입력값 검증 후 API 연동하여 신규 계정 생성

import React, { useState } from 'react';
import logo from '../assets/logo_eye.png';
import api from '../api';

function Signin({ setPage }) {
  const [id, setId] = useState('');                  // 이메일(ID)
  const [password, setPassword] = useState('');      // 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인

  // 회원가입 처리
  const handleSignup = async () => {
    if (!id.trim() || !password.trim()) {
      alert('ID(이메일)와 비밀번호를 모두 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // POST /api/v1/auth/signup 호출
      await api.post('/api/v1/auth/signup', {
        email: id.trim(),
        password: password,
      });

      alert('회원가입이 성공적으로 완료되었습니다.');
      setPage('success'); // 성공 페이지로 이동
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`회원가입 실패: ${error.response.data.detail}`);
      } else {
        alert('회원가입 중 오류가 발생했습니다.');
      }
      console.error("Signup error:", error);
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
      {/* 로고 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <img src={logo} alt="logo" style={{ width: 53, height: 33, marginRight: 8 }} />
        <div style={{ fontSize: 24, fontWeight: 600, color: '#1171C0' }}>See Cure</div>
      </div>

      {/* 안내 */}
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>회원 가입</h2>
      <p style={{ fontSize: 14, marginTop: 4, marginBottom: 20 }}>
        ID와 Password를 입력하세요.
      </p>

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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ height: 40, padding: '0 12px', borderRadius: 6, border: '1px solid #E0E0E0', fontSize: 14 }}
        />
        <button
          onClick={handleSignup}
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
          Sign in
        </button>
      </div>
    </div>
  );
}

export default Signin;
