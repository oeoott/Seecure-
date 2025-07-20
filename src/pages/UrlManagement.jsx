// src/pages/UrlManagement.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../UrlManagement.module.css';

const UrlManagement = ({ setPage }) => {

  const [urls, setUrls] = useState(() => {
    const savedUrls = localStorage.getItem('managedUrls');
    if (savedUrls) {
      return JSON.parse(savedUrls);
    } else {
      return [
        { id: 1, url: 'https://www.example.com/my-profile' },
        { id: 2, url: 'https://www.my-secret-page.com/document/12345' },
        { id: 3, url: 'https://www.another-site.co.kr' },
      ];
    }
  });

  useEffect(() => {
    localStorage.setItem('managedUrls', JSON.stringify(urls));
  }, [urls]);


  const handleDelete = (idToDelete) => {
    if (window.confirm('정말 이 URL을 삭제하시겠습니까?')) {
      setUrls(currentUrls => currentUrls.filter(url => url.id !== idToDelete));
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