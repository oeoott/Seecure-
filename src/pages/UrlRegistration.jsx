// src/pages/UrlRegistration.jsx

import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import '../UrlRegistration.css';

const UrlRegistration = ({ setPage }) => {
  const [url, setUrl] = useState('');

  const handleRegister = () => {
    if (!url.trim()) {
      alert('URL을 입력해주세요.');
      return;
    }

    const savedUrls = localStorage.getItem('managedUrls');
    const urlList = savedUrls ? JSON.parse(savedUrls) : [];

    const newUrl = {
      id: Date.now(),
      url: url.trim(),
    };

    const updatedList = [...urlList, newUrl];
    localStorage.setItem('managedUrls', JSON.stringify(updatedList));

    alert('등록되었습니다.');
    setUrl('');
  };

  return (
    <div className="page-container">
      <Sidebar currentPage="UrlRegistration" setPage={setPage} />
      <main className="url-main-content">
        {/* ✅ 이 div가 콘텐츠를 중앙 정렬하기 위해 추가되었습니다. */}
        <div className="content-block">
          <div className="title-container">
            <h1 className="main-title">URL 등록</h1>
            <p className="subtitle">보호할 정보가 있는 URL을 등록해보세요.</p>
          </div>
          <div className="registration-form">
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
        </div>
      </main>
    </div>
  );
};

export default UrlRegistration;