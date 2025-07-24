// src/pages/UrlRegistration.jsx (현재 상태 유지)

import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import '../UrlRegistration.css';
import api from '../api'; // api 모듈 import

const UrlRegistration = ({ setPage }) => {
  const [url, setUrl] = useState('');

  // handleRegister 함수는 이미 API 호출 로직으로 수정되어 있습니다.
  const handleRegister = async () => {
    if (!url.trim()) {
      alert('URL을 입력해주세요.');
      return;
    }

    try {
      // POST /api/v1/protections/ API 호출
      // 백엔드 스키마에 따라 url_pattern과 mode를 전송합니다.
      // mode는 UI에 선택 기능이 없으므로 'blur'로 기본값을 지정합니다.
      await api.post('/api/v1/protections/', {
        url_pattern: url.trim(),
        mode: 'blur', // 백엔드 schemas.ProtectionCreate 스키마에 따라 'mode' 필드 사용
      });

      alert('등록되었습니다.');
      setUrl(''); // 입력 필드 초기화
      // (선택) 등록 후 목록 페이지로 이동시킬 수 있습니다.
      // setPage('UrlManagement');

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`URL 등록 실패: ${error.response.data.detail}`);
      } else {
        alert('URL 등록 중 오류가 발생했습니다.');
        console.error("Failed to register URL:", error);
      }
    }
  };

  return (
    <div className="page-container">
      <Sidebar currentPage="UrlRegistration" setPage={setPage} />
      <main className="url-main-content">
        <div className="content-block">
          <div className="title-container">
            <h1 className="main-title">URL 등록</h1>
            <p className="subtitle">보호할 정보가 있는 URL을 등록해보세요.</p>
          </div>
          <div className="registration-form">
            <input
              type="text"
              className="url-input"
              placeholder="예: https://www.example.com/private/info"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button className="register-button" onClick={handleRegister}>
              등록
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UrlRegistration;