// src/pages/FaceRegistration.jsx

import React, { useState, useRef, useCallback } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../FaceRegistration.module.css';
import api from '../api';

const FaceRegistration = ({ setPage }) => {
  const [name, setName] = useState('');
  const [isCapturing, setIsCapturing] = useState(false); // 캡처 중 상태
  const webcamRef = useRef(null); // video 태그에 접근하기 위한 ref

  // 등록 버튼 클릭 시 실행될 함수
  const handleRegister = useCallback(async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!webcamRef.current || !webcamRef.current.srcObject) {
      alert('웹캠이 활성화되지 않았습니다.');
      return;
    }

    setIsCapturing(true); // 로딩 시작

    // 1. 웹캠에서 현재 프레임 캡처
    const video = webcamRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. 캔버스 이미지를 Blob 객체로 변환
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert('이미지 캡처에 실패했습니다.');
        setIsCapturing(false);
        return;
      }

      // 3. FormData에 이미지 파일과 이름(label)을 담아 서버로 전송
      const formData = new FormData();
      formData.append('file', blob, 'webcam-capture.jpg');
      formData.append('label', name.trim());

      try {
        const response = await api.post('/api/v1/ai/register-face', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        alert(response.data.message);
        setName('');
        setPage('FaceManagement'); // 등록 후 목록 페이지로 이동

      } catch (error) {
        if (error.response && error.response.data && error.response.data.detail) {
          alert(`얼굴 등록 실패: ${error.response.data.detail}`);
        } else {
          alert('얼굴 등록 중 오류가 발생했습니다.');
        }
        console.error('Face registration error:', error);
      } finally {
        setIsCapturing(false); // 로딩 종료
      }
    }, 'image/jpeg');

  }, [name, setPage]);

  // 웹캠 스트림을 비디오 요소에 연결하는 함수
  const handleVideoRef = useCallback((node) => {
    if (node !== null) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          node.srcObject = stream;
          webcamRef.current = node;
        })
        .catch(err => {
          console.error("웹캠 접근 오류:", err);
          alert("웹캠에 접근할 수 없습니다. 권한을 확인해주세요.");
        });
    }
  }, []);

  return (
    <div className={styles.pageContainer}>
      <Sidebar currentPage="FaceRegistration" setPage={setPage} />
      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <header className={styles.mainHeader}>
            <h1 className={styles.mainTitle}>얼굴 등록</h1>
            <p className={styles.subtitle}>웹캠을 통해 얼굴을 등록해보세요.</p>
          </header>

          {/* videoBox 안에 웹캠 영상이 표시됩니다. */}
          <div className={styles.videoBox}>
            <video
              ref={handleVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '35px' }}
            />
          </div>
          
          <div className={styles.formRow}>
            <label>이름 입력</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              disabled={isCapturing} // 캡처 중에는 입력 비활성화
            />
            <button onClick={handleRegister} disabled={isCapturing}>
              {isCapturing ? '등록 중...' : '등록'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;
