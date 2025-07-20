<<<<<<< HEAD
// src/pages/SecureOption.jsx

import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import '../SecureOption.css';

const SecureOption = ({ setPage }) => {
  // ✅ 2. 불러오기: 컴포넌트가 처음 로드될 때 localStorage에서 값을 불러와 초기 상태를 설정합니다.
  // 저장된 값이 없으면 기본값으로 true(ON)를 사용합니다.
  const [isBlurOn, setIsBlurOn] = useState(() => {
    const saved = localStorage.getItem('isBlurOn');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isPopupOn, setIsPopupOn] = useState(() => {
    const saved = localStorage.getItem('isPopupOn');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // ✅ 1. 저장하기: '저장' 버튼을 눌렀을 때 호출될 함수
  const handleSave = () => {
    // 현재 state 값들을 localStorage에 문자열 형태로 저장합니다.
    localStorage.setItem('isBlurOn', JSON.stringify(isBlurOn));
    localStorage.setItem('isPopupOn', JSON.stringify(isPopupOn));
    alert('설정이 저장되었습니다!'); // 사용자에게 저장되었음을 알림
  };

  return (
    <div className="page-container">
      <Sidebar currentPage="SecureOption" setPage={setPage} />

      <div className="content-wrapper">
        <main className="main-content">
          <h2 className="main-title">보호 옵션</h2>
          <p className="subtitle">원하는 보호 옵션을 선택해보세요.</p>
        </main>

        <section className="options-container">
          {/* 화면 블러 효과 옵션 */}
          <div className="option-item">
            <span className="option-title">화면 블러 효과</span>
            <div className="toggle-switch">
              <span className="toggle-label">ON</span>
              <div
                className={`toggle-box ${isBlurOn ? 'selected' : 'unselected'}`}
                onClick={() => setIsBlurOn(true)}
              />
              <span className="toggle-label inactive">OFF</span>
              <div
                className={`toggle-box ${!isBlurOn ? 'selected' : 'unselected'}`}
                onClick={() => setIsBlurOn(false)}
              />
            </div>
          </div>

          {/* 경고 알림 팝업 옵션 */}
          <div className="option-item">
            <span className="option-title">경고 알림 팝업</span>
            <div className="toggle-switch">
              <span className="toggle-label">ON</span>
              <div
                className={`toggle-box ${isPopupOn ? 'selected' : 'unselected'}`}
                onClick={() => setIsPopupOn(true)}
              />
              <span className="toggle-label inactive">OFF</span>
              <div
                className={`toggle-box ${!isPopupOn ? 'selected' : 'unselected'}`}
                onClick={() => setIsPopupOn(false)}
              />
            </div>
          </div>
        </section>

        {/* 👇 저장 버튼에 onClick 이벤트와 handleSave 함수를 연결합니다. */}
        <button className="save-button" onClick={handleSave}>
          저장
        </button>
      </div>
    </div>
  );
};

=======
import React from 'react';
import Sidebar from './Sidebar'; // Sidebar 컴포넌트 import
import './SecureOption.css'; // 메인 페이지 CSS import

const SecureOption = () => {
  return (
    <div className="secure-option-container">
      <Sidebar />

      <main className="main-content">
        <h2 className="main-title">보호 옵션</h2>
        <p className="subtitle">원하는 보호 옵션을 선택해보세요.</p>
      </main>

      <section className="options-container">
        <div className="option-item">
          <span className="option-title">화면 블러 효과</span>
          <div className="toggle-switch">
            <span className="toggle-label">ON</span>
            <div className="toggle-box selected" />
            <span className="toggle-label inactive">OFF</span>
            <div className="toggle-box unselected" />
          </div>
        </div>
        <div className="option-item">
          <span className="option-title">경고 알림 팝업</span>
          <div className="toggle-switch">
            <span className="toggle-label">ON</span>
            <div className="toggle-box selected" />
            <span className="toggle-label inactive">OFF</span>
            <div className="toggle-box unselected" />
          </div>
        </div>
      </section>

      <button className="save-button">저장</button>
    </div>
  );
};

>>>>>>> LSJ
export default SecureOption;