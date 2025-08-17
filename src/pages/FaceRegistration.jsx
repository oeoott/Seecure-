// src/pages/FaceRegistration.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../FaceRegistration.module.css';
import api from '../api';

const FaceRegistration = ({ setPage }) => {
  const [name, setName] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false); // 등록 중 상태 추가
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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

  useEffect(() => {
    startCamera();
    // 컴포넌트가 언마운트될 때 카메라 스트림을 정리합니다.
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [startCamera]);

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

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 캔버스 이미지를 Blob 객체로 변환합니다.
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("이미지 캡처에 실패했습니다.");
        setIsCapturing(false);
        return;
      }

      // Blob을 File 객체로 만듭니다.
      const imageFile = new File([blob], "face_capture.jpg", { type: "image/jpeg" });

      // FormData 객체를 생성하고, 'file'이라는 키로 이미지 파일을 추가합니다.
      const formData = new FormData();
      formData.append('file', imageFile);

      try {
        // 1. AI 서버에 얼굴 이미지를 보내 임베딩을 등록합니다.
        await api.post('/api/v1/ai/register-face', formData);
        
        // 2. 데이터베이스에 얼굴 이름(label)과 임시 URL을 저장합니다.
        await api.post('/api/v1/faces/', { 
          label: name, // 백엔드 스키마에 맞게 'label' 키를 사용합니다.
          image_url: 'local_embedding.jpg' // 백엔드에서 요구하는 필수 필드
        });

        alert("얼굴 등록 성공");
        setName('');
        setPage('FaceManagement'); // 등록 성공 후 관리 페이지로 이동

      } catch (error) {
        console.error("얼굴 등록 에러:", error);
        let errorMessage = '얼굴 등록 중 오류가 발생했습니다.';

        // 서버에서 보낸 상세 에러 메시지를 추출하여 사용자에게 보여줍니다.
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

          <div className={styles.videoBox}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '35px' }}
            />
            {/* 캡처를 위한 canvas는 보이지 않게 유지합니다. */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
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
