// src/pages/UrlManagement.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../UrlManagement.module.css';
import api from '../api';

const UrlManagement = ({ setPage }) => {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await api.get('/api/v1/protections/');
        const fetchedUrls = response.data.map(item => ({
          id: item.id,
          url: item.url_pattern,
        }));
        setUrls(fetchedUrls);
      } catch (error) {
        // ⭐️ 수정된 부분
        console.error("Failed to fetch URLs:", error);
        if (error.response && error.response.status === 401) {
          alert('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
          setPage('login');
        } else {
          alert("URL 목록을 불러오는데 실패했습니다.");
        }
      }
    };
    fetchUrls();
  }, [setPage]);

  const handleDelete = async (idToDelete) => {
    if (window.confirm('정말 이 URL을 삭제하시겠습니까?')) {
      try {
        await api.delete(`/api/v1/protections/${idToDelete}`);
        setUrls(currentUrls => currentUrls.filter(url => url.id !== idToDelete));
        alert('삭제되었습니다.');
      } catch (error) {
        // ⭐️ 수정된 부분
        console.error("Failed to delete URL:", error);
        if (error.response && error.response.status === 401) {
          alert('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
          setPage('login');
        } else {
          alert("URL 삭제 중 오류가 발생했습니다.");
        }
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar currentPage="UrlManagement" setPage={setPage} />
      <div className={styles.contentWrapper}>
        <header className={styles.mainHeader}>
          <h1 className={styles.mainTitle}>등록 URL 관리</h1>
          <p className={styles.subtitle}>등록된 URL을 관리해보세요.</p>
        </header>
        <main className={styles.urlListContainer}>
          {urls.map(item => (
            <div key={item.id} className={styles.urlItem}>
              <span className={styles.urlText} title={item.url}>{item.url}</span>
              <button className={styles.deleteButton} onClick={() => handleDelete(item.id)}>
                삭제
              </button>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default UrlManagement;