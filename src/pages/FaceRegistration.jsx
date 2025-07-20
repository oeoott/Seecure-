import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../FaceRegistration.module.css';

const FaceRegistration = ({ setPage }) => {
  const [name, setName] = useState('');

  const handleRegister = () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    try {
      const savedFaces = localStorage.getItem('managedFaces');
      const faceList = savedFaces ? JSON.parse(savedFaces) : [];
      const newFace = { id: Date.now(), name: name.trim(), imageUrl: null };
      const updatedList = [...faceList, newFace];
      localStorage.setItem('managedFaces', JSON.stringify(updatedList));
      alert('등록되었습니다.');
      setName('');
    } catch (error) {
      console.error("Failed to update face list in localStorage:", error);
      alert("데이터 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar currentPage="FaceRegistration" setPage={setPage} />
      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <header className={styles.mainHeader}>
            <h1 className={styles.mainTitle}>얼굴 등록</h1>
            <p className={styles.subtitle}>웹캠을 통해 얼굴을 등록해보세요.</p>
          </header>
          <div className={styles.videoBox} />
          <div className={styles.formRow}>
            <label>이름 입력</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
            />
            <button onClick={handleRegister}>등록</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;
