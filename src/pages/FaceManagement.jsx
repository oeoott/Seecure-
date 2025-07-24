// src/pages/FaceManagement.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../FaceManagement.module.css';
import api from '../api';

const FaceManagement = ({ setPage }) => {
  const [faceList, setFaceList] = useState([]);

  useEffect(() => {
    const fetchFaces = async () => {
      try {
        const response = await api.get('/api/v1/faces/');
        const fetchedFaces = response.data.map(face => ({
          id: face.id,
          name: face.label || '이름 없음',
          imageUrl: face.image_url,
        }));
        setFaceList(fetchedFaces);
      } catch (error) {
        // ⭐️ 수정된 부분
        console.error("Failed to fetch faces:", error);
        if (error.response && error.response.status === 401) {
          alert('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
          setPage('login');
        } else {
          alert("등록된 얼굴 목록을 불러오는데 실패했습니다.");
        }
      }
    };
    fetchFaces();
  }, [setPage]);

  const handleDelete = async (idToDelete) => {
    if (window.confirm('정말 이 얼굴 데이터를 삭제하시겠습니까?')) {
      try {
        await api.delete(`/api/v1/faces/${idToDelete}`);
        setFaceList(current => current.filter(face => face.id !== idToDelete));
        alert('삭제되었습니다.');
      } catch (error) {
        // ⭐️ 수정된 부분
        console.error("Failed to delete face:", error);
        if (error.response && error.response.status === 401) {
          alert('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
          setPage('login');
        } else {
          alert("얼굴 데이터 삭제 중 오류가 발생했습니다.");
        }
      }
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