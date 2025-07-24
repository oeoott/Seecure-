// src/pages/Success.jsx
import React from 'react';
import logo from '../assets/logo_eye.png';

function Success({ setPage }) {
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
        textAlign: 'center',
        gap: 24,
      }}
    >
      {/* 로고 및 타이틀 */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={logo}
          alt="logo"
          style={{ width: 50, height: 30, marginRight: 8 }}
        />
        <div style={{ fontSize: 32, fontWeight: 600, color: '#1171C0' }}>See Cure</div>
      </div>

      {/* 메시지 */}
      <div>
        <h1 style={{ fontSize: 36, margin: 0, fontWeight: 600 }}>회원 가입 완료!</h1>
        <p style={{ fontSize: 20, marginTop: 8 }}>
          축하드립니다. 회원가입이 성공적으로 완료되었습니다.
        </p>
      </div>

      {/* 로그인하기 버튼 → 로그인 페이지로 이동 */}
      <button
        onClick={() => setPage('login')}
        style={{
          width: 300,
          height: 40,
          backgroundColor: '#1171C0',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        로그인하기
      </button>
    </div>
  );
}

export default Success;
