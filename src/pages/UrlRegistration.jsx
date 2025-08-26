// src/pages/UrlRegistration.jsx
// 보호할 URL을 등록하는 페이지: API 호출하여 서버에 URL 저장

import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import '../UrlRegistration.css';
import api from '../api';

const UrlRegistration = ({ setPage }) => {
  const [url, setUrl] = useState(''); // 입력된 URL 상태

  // URL 등록
  const handleRegister = async () => {
    if (!url.trim()) {
      alert('URL을 입력해주세요.');
      return;
    }

    try {
      // POST /api/v1/protections/
      await api.post('/api/v1/protections/', {
        url_pattern: url.trim(),
        mode: 'blur', // 기본 보호 모드
      });

      alert('등록되었습니다.');
      setUrl(''); 
      // 필요 시: setPage('UrlManagement'); 로 이동
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
