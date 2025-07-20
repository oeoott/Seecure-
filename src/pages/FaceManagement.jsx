// src/pages/FaceManagement.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx'; // 재사용 가능한 사이드바 임포트
import styles from '../FaceManagement.module.css'; // 다른 페이지와 스타일 통일을 위해 재사용

const FaceManagement = ({ setPage }) => {
  // 얼굴 목록 상태를 컴포넌트 내부에서 관리
  const [faceList, setFaceList] = useState(() => {
    const savedFaces = localStorage.getItem('managedFaces');
    if (savedFaces) {
      return JSON.parse(savedFaces);
    } else {
      // 기본 데이터
      return [
        { id: 1, name: '홍길동', imageUrl: null },
        { id: 2, name: '김철수', imageUrl: null },
      ];
    }
  });

  // faceList가 변경될 때마다 localStorage에 자동 저장
  useEffect(() => {
    localStorage.setItem('managedFaces', JSON.stringify(faceList));
  }, [faceList]);

  // 삭제 버튼 클릭 시 해당 얼굴 제거
  const handleDelete = (idToDelete) => {
    if (window.confirm('정말 이 얼굴 데이터를 삭제하시겠습니까?')) {
      setFaceList(currentFaces => currentFaces.filter(face => face.id !== idToDelete));
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* 재사용 가능한 Sidebar 컴포넌트 사용 */}
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
                {/* 추후 이미지를 표시할 수 있는 영역 */}
                {/* <img src={face.imageUrl || defaultImage} alt={face.name} /> */}
                <span className={styles.urlText}>{face.name}</span>
                <button className={styles.deleteButton} onClick={() => handleDelete(face.id)}>
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