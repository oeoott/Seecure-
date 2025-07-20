import React from 'react';
import logo from '../assets/logo.png';

function Login({ setPage }) {
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
      {/* 로고 및 타이틀 */}
      <div style={{ display: 'flex', alignItems: 'center'}}>
        <img
          src={logo}
          alt="logo"
          style={{ width: 32, height: 32, marginRight: 8 }}
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
          style={{
            height: 40,
            padding: '0 12px',
            borderRadius: 6,
            border: '1px solid #E0E0E0',
            fontSize: 14,
          }}
        />
        <button
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
