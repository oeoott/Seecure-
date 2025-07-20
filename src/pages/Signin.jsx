import React, { useState } from 'react';
import logo from '../assets/logo.png';

function Signin({ setCurrentPage }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 회원가입 버튼 클릭 시 처리
  const handleSignup = () => {
    // 조건 0: 길이 체크
    if (id.length <= 2) {
      alert('ID는 3자리 이상이어야 합니다.');
      return;
    }

    if (password.length <= 2) {
      alert('비밀번호는 3자리 이상이어야 합니다.');
      return;
    }

    // 조건 1: ID 중복 체크 (임의 조건 - 'existinguser'는 이미 존재하는 ID라고 가정)
    const isIdAvailable = id !== 'existinguser';

    // 조건 2: 비밀번호 일치 확인
    const isPasswordMatch = password === confirmPassword;

    if (!isIdAvailable) {
      alert('이미 존재하는 ID입니다. 다른 ID를 입력하세요.');
      return;
    }

    if (!isPasswordMatch) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 모든 조건 충족 시 success 페이지로 이동
    setCurrentPage('success');
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
      {/* 로고 및 타이틀 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <img
          src={logo}
          alt="logo"
          style={{ width: 32, height: 32, marginRight: 8 }}
        />
        <div style={{ fontSize: 24, fontWeight: 600, color: '#1171C0' }}>See Cure</div>
      </div>

      {/* 회원가입 안내 */}
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>회원 가입</h2>
      <p style={{ fontSize: 14, marginTop: 4, marginBottom: 20 }}>
        ID와 Password를 입력하세요.
      </p>

      {/* 회원가입 폼 */}
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          onClick={handleSignup}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

export default Signin;
