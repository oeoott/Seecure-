// src/pages/FaceRegistration.jsx
// 웹캠으로 얼굴 이미지를 캡처해 등록하는 페이지 컴포넌트

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../FaceRegistration.module.css';
import api from '../api';

const FaceRegistration = ({ setPage }) => {
  const [name, setName] = useState('');           // 입력된 이름
  const [isCameraOn, setIsCameraOn] = useState(false); 
  const [isCapturing, setIsCapturing] = useState(false); // 등록 중 상태
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 카메라 시작
  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current.play();
              setIsCameraOn(true);
              console.log("[성공] 카메라 연결 성공");
            } catch (err) {
              console.error("[실패] video play() 실패", err);
            }
          };
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("웹캠을 사용할 수 없습니다. 카메라 권한을 확인해주세요.");
      }
    }
  }, []);

  // 언마운트 시 카메라 해제
  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  // 얼굴 등록
  const handleRegister = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!isCameraOn || !videoRef.current) {
      alert("카메라가 준비되지 않았습니다.");
      return;
    }

    setIsCapturing(true); // 등록 시작

    // 캡처
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 캔버스 → Blob → File 변환
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("이미지 캡처에 실패했습니다.");
        setIsCapturing(false);
        return;
      }
      const imageFile = new File([blob], "face_capture.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append('file', imageFile);

      try {
        // 1. AI 서버에 등록
        await api.post('/api/v1/ai/register-face', formData);
        // 2. DB에 이름 + 임시 URL 저장
        await api.post('/api/v1/faces/', { 
          label: name,
          image_url: 'local_embedding.jpg'
        });

        alert("얼굴 등록 성공");
        setName('');
        setPage('FaceManagement'); // 관리 페이지로 이동

      } catch (error) {
        console.error("얼굴 등록 에러:", error);
        let errorMessage = '얼굴 등록 중 오류가 발생했습니다.';

        // 서버 상세 에러 메시지 처리
        if (error.response?.data?.detail) {
          const detail = error.response.data.detail;
          if (typeof detail === 'string') {
            errorMessage = `얼굴 등록 실패: ${detail}`;
          } else if (Array.isArray(detail) && detail.length > 0) {
            const firstError = detail[0];
            const errorLocation = firstError.loc.join(' -> ');
            errorMessage = `얼굴 등록 실패: [${errorLocation}] ${firstError.msg}`;
          } else {
            errorMessage = `얼굴 등록 실패: ${JSON.stringify(detail)}`;
          }
        }
        alert(errorMessage);
      } finally {
        setIsCapturing(false); // 등록 종료
      }
    }, 'image/jpeg');
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

          {/* 영상 표시 */}
          <div className={styles.videoBox}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '35px' }}
            />
            {/* 캡처용 canvas (숨김) */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </div>
          
          {/* 입력 폼 */}
          <div className={styles.formRow}>
            <label>이름 입력</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              disabled={isCapturing}
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
