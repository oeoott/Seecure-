import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../FaceManagement.module.css';

const FaceManagement = ({ setPage }) => {
  const [faceList, setFaceList] = useState(() => {
    const savedFaces = localStorage.getItem('managedFaces');
    return savedFaces ? JSON.parse(savedFaces) : [
      { id: 1, name: '홍길동', imageUrl: null },
      { id: 2, name: '김철수', imageUrl: null },
    ];
  });

  useEffect(() => {
    localStorage.setItem('managedFaces', JSON.stringify(faceList));
  }, [faceList]);

  const handleDelete = (idToDelete) => {
    if (window.confirm('정말 이 얼굴 데이터를 삭제하시겠습니까?')) {
      setFaceList(current => current.filter(face => face.id !== idToDelete));
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar currentPage="FaceManagement" setPage={setPage} />
      
      <div className={styles.contentWrapper}>
        <header className={styles.mainHeader}>
          <h1 className={styles.mainTitle}>등록 얼굴 관리</h1>
          <p className={styles.subtitle}>등록된 얼굴 데이터를 관리해보세요.</p>
        </header>

        <main className={styles.urlListContainer}>
          {faceList.length > 0 ? (
            faceList.map(face => (
              <div key={face.id} className={styles.urlItem}>
                <span className={styles.urlText}>{face.name}</span>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(face.id)}
                >
                  삭제
                </button>
              </div>
            ))
          ) : (
            <p>등록된 얼굴이 없습니다.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default FaceManagement;
