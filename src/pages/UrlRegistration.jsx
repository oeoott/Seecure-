// src/pages/UrlRegistration.jsx

import React, { useState } from 'react'; // ✅ useState 훅 불러오기
import Sidebar from './Sidebar.jsx';
import '../UrlRegistration.css';

const UrlRegistration = ({ setPage }) => {
  // ✅ 입력된 URL을 저장할 state 변수 생성
  const [url, setUrl] = useState('');

  // ✅ 등록 버튼 클릭 시 실행될 함수
  const handleRegister = () => {
    // URL이 비어있으면 아무것도 하지 않음
    if (!url.trim()) {
      alert('URL을 입력해주세요.');
      return;
    }

    // 1. localStorage에서 기존 URL 목록 가져오기
    //    (UrlManagement.jsx에서 사용하는 키 'managedUrls'와 동일해야 함)
    const savedUrls = localStorage.getItem('managedUrls');
    const urlList = savedUrls ? JSON.parse(savedUrls) : [];

    // 2. 새 URL 객체 생성
    const newUrl = {
      id: Date.now(), // 고유한 ID로 현재 시간 사용
      url: url.trim(),
    };

    // 3. 기존 목록에 새 URL 추가 후 다시 저장
    const updatedList = [...urlList, newUrl];
    localStorage.setItem('managedUrls', JSON.stringify(updatedList));

    // 4. 완료 알림 및 입력 필드 초기화
    alert('등록되었습니다.');
    setUrl('');
  };

  return (
    <div className="page-container">
      <Sidebar currentPage="UrlRegistration" setPage={setPage} />
      <main className="url-main-content">
        <div className="title-container">
          <h1 className="main-title">URL 등록</h1>
          <p className="subtitle">보호할 정보가 있는 URL을 등록해보세요.</p>
        </div>
        <div className="registration-form">
          {/* ✅ input과 state, button과 함수를 연결 */}
          <input
            type="text"
            className="url-input"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="register-button" onClick={handleRegister}>
            등록
          </button>
        </div>
      </main>
    </div>
  );
};

export default UrlRegistration;