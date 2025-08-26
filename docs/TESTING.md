# TESTING.md
## SeeCure: 설치 확인 및 테스트 지침

본 문서는 **심사위원 및 개발자**가 SeeCure 애플리케이션 설치 후 기능을 검증할 수 있도록 작성되었습니다.  
README.md에서 다루지 않은 추가 정보와 테스트 시나리오를 포함합니다.

---

## **1. 설치 확인 체크리스트**

- [ ] 백엔드 서버 실행 (`uvicorn app.main:app --reload`)
- [ ] 프론트엔드 빌드 완료 (`npm run build`)
- [ ] Chrome 확장프로그램 정상 로드
- [ ] 회원가입 / 로그인 가능
- [ ] URL 등록 및 삭제 가능
- [ ] 얼굴 등록 및 삭제 가능
- [ ] 보호 모드 ON → 등록된 URL 접속 후 등록되지 않은 얼굴 감지 시 블러 또는 팝업 발생
- [ ] Service Worker 콘솔에 `[AI 감지 결과]` 로그 출력

## 2. 환경 변수 예시

`.env` 파일에 다음 변수를 설정할 수 있습니다:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
SECRET_KEY=your-secret-key
```

## 3. 제한 사항

* 현재는 Google Chrome 브라우저만 지원

* Windows 환경에서 테스트됨 (Mac/Linux는 실험적)

* CPU 환경에서는 AI 감지 속도가 다소 느릴 수 있음

* 확장프로그램은 등록된 URL에서만 동작

## 4. 테스트 시나리오 (End-to-End)

### 1. 백엔드 서버 실행
```powershell
	uvicorn app.main:app --reload
```
→ Uvicorn running on http://127.0.0.1:8000 메시지 확인

### 2. 프론트엔드 빌드
```powershell
	npm run build
```
→ dist/ 폴더 생성 확인

### 3. 확장프로그램 로드

* Chrome → chrome://extensions

* 개발자 모드 ON → dist/ 폴더 로드

### 4. 회원가입 / 로그인

* SeeCure 홈에서 회원가입 후 로그인

* localStorage.token 값이 저장되는지 확인

### 5. URL 등록

* UrlRegistration 페이지에서 예: https://naver.com 등록

* UrlManagement 페이지에서 등록 확인

### 6. 얼굴 등록

* FaceRegistration에서 본인 얼굴 등록

* FaceManagement에서 목록 확인

### 7. 보호 모드 테스트

* 확장프로그램 팝업에서 보호 모드 ON

* 등록된 URL(https://naver.com) 접속

* 다른 얼굴 등장 시: 블러 + 팝업 발생

### 8. 로그 확인 (개발자용)

* Chrome → chrome://extensions → SeeCure 서비스 워커 콘솔

* 정상 동작 시 다음과 같은 로그 확인:
	```yaml
	[AI 감지 결과] {intruder_alert: false, similarity_score: 0.887}...
	```

---

## 5. 참조 자료

- [InsightFace: 2D & 3D Face Analysis Toolbox](https://github.com/deepinsight/insightface) — Apache License 2.0  
- [FastAPI: Modern, Fast (high-performance) web framework for building APIs](https://fastapi.tiangolo.com/) — MIT License  
- [React: A JavaScript library for building user interfaces](https://react.dev/) — MIT License  
- [Chrome Extensions (Manifest V3) Documentation](https://developer.chrome.com/docs/extensions/mv3/)  
- [SQLAlchemy: The Python SQL Toolkit and Object Relational Mapper](https://www.sqlalchemy.org/)  
- [PostgreSQL: The World's Most Advanced Open Source Relational Database](https://www.postgresql.org/)  
- [OpenCV: Open Source Computer Vision Library](https://opencv.org/)  
- [ONNX Runtime: Cross-platform, high performance scoring engine for ML models](https://onnxruntime.ai/)  


