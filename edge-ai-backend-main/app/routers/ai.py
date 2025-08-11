# app/routers/ai.py

# 🔽 필요한 모든 모듈을 정확하게 import 합니다.
from fastapi import APIRouter, Depends, HTTPException, Body, File, UploadFile
from sqlalchemy.orm import Session
from pydantic import BaseModel

# 🔽 프로젝트 내부 모듈들을 import 합니다.
from app.database import get_db
from app.routers.auth import get_current_user
import app.crud as crud
import app.schemas as schemas
from app.detection.ai_service import AIService

# 🔽 파이썬 기본 라이브러리들을 import 합니다.
import numpy as np
import cv2
import base64

# --- API가 받을 데이터 형식 정의 ---

# 얼굴 등록 시 React 앱으로부터 받을 데이터 모델
class FaceRegisterPayload(BaseModel):
    name: str
    image: str # base64로 인코딩된 이미지 문자열

# --- 전역 AI 서비스 인스턴스 생성 ---
# 서버가 시작될 때 AI 모델을 딱 한 번만 로드하여 메모리에 상주 시킵니다.
ai_service = AIService()

# --- 라우터 설정 ---
router = APIRouter(
    tags=["AI Detection"],
)

# --- 유틸리티 함수 ---
def base64_to_cv2(b64_string: str) -> np.ndarray:
    """Base64 문자열을 OpenCV 이미지(numpy array)로 변환하는 함수"""
    try:
        if "," in b64_string:
            b64_string = b64_string.split(',')[1]
        img_bytes = base64.b64decode(b64_string)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        frame = cv2.imdecode(img_array, flags=cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("이미지 디코딩 실패")
        return frame
    except Exception as e:
        raise ValueError(f"Base64 디코딩 중 오류 발생: {e}")


# --- API 엔드포인트 정의 ---

@router.post("/register-face", summary="사용자 얼굴 등록")
def register_user_face(
    payload: FaceRegisterPayload,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """
    React 앱에서 받은 Base64 이미지와 이름으로 얼굴을 등록하고 DB에 저장합니다.
    """
    try:
        # 1. Base64 이미지를 OpenCV 프레임으로 변환
        frame = base64_to_cv2(payload.image)

        # 2. AI 서비스를 통해 얼굴 특징(.npy 파일) 저장
        success = ai_service.register_face(frame)
        if not success:
            raise HTTPException(status_code=400, detail="사진에서 얼굴을 찾을 수 없습니다. 정면을 응시하고 다시 시도해주세요.")

        # 3. AI 처리가 성공하면, 그 정보를 DB에 저장
        face_data = schemas.FaceCreate(label=payload.name, image_url=ai_service.embedding_path)
        crud.create_face(db=db, user_id=current_user.id, face=face_data)

        return {"message": f"'{payload.name}'님의 얼굴이 성공적으로 등록되었습니다."}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"얼굴 등록 중 서버 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"서버 내부 오류가 발생했습니다.")


@router.post("/detect-frame", summary="침입자 감지")
async def detect_intruders(
    file: UploadFile = File(...),
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """
    Chrome 확장 프로그램에서 받은 이미지 파일로 침입자를 감지합니다.
    """
    try:
        # 1. 등록된 얼굴이 있는지 먼저 확인
        if ai_service.user_embedding is None:
             raise HTTPException(status_code=404, detail="등록된 사용자 얼굴이 없습니다. 먼저 얼굴을 등록해주세요.")

        # 2. 전송된 파일을 읽어서 OpenCV 프레임으로 변환
        image_bytes = await file.read()
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="유효하지 않은 이미지 파일입니다.")

        # 3. AI 서비스를 통해 침입자 감지 로직 수행
        result = ai_service.detect_intrusion(frame)
        
        return result

    except Exception as e:
        print(f"침입자 감지 중 서버 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"서버 내부 오류가 발생했습니다.")
