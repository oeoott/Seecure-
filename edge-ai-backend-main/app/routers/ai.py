# app/routers/ai.py

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel # ⭐️ 누락되었던 import 구문을 여기에 추가했습니다.

# 🔽 DB 및 인증 관련 모듈 import
from app.database import get_db
from app.routers.auth import get_current_user
import app.crud as crud
import app.schemas as schemas

# 🔽 새로운 AI 서비스 및 유틸리티 import
from app.detection.ai_service import AIService
import numpy as np
import cv2
import base64

# --- 🔽 API가 받을 데이터 형식 정의 ---
# 프론트엔드에서 이름과 이미지를 함께 받기 위한 모델
class FaceRegisterPayload(BaseModel):
    name: str
    image: str # base64-encoded string

# 일반 이미지 요청을 위한 모델
class ImagePayload(BaseModel):
    image: str

# --- AI 서비스 인스턴스 생성 ---
# 서버 시작 시 모델을 한 번만 로드합니다.
ai_service = AIService()

# --- 라우터 생성 ---
router = APIRouter(
    tags=["AI Detection"],
)

def base64_to_cv2(b64_string: str):
    """base64 문자열을 OpenCV 이미지(numpy array)로 변환"""
    if "," in b64_string:
        b64_string = b64_string.split(',')[1]
    img_bytes = base64.b64decode(b64_string)
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    return cv2.imdecode(img_array, flags=cv2.IMREAD_COLOR)


@router.post("/register-face")
def register_user_face(
    payload: FaceRegisterPayload,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """
    Base64 인코딩된 이미지와 이름을 받아 AI 처리 후 DB에 저장합니다.
    """
    try:
        frame = base64_to_cv2(payload.image)
        success = ai_service.register_face(frame)
        if not success:
            raise HTTPException(status_code=400, detail="사진에서 얼굴을 찾을 수 없습니다. 다시 시도해주세요.")

        face_data = schemas.FaceCreate(label=payload.name, image_url=ai_service.embedding_path)
        crud.create_face(db=db, user_id=current_user.id, face=face_data)

        return {"message": f"'{payload.name}'님의 얼굴이 성공적으로 등록되었습니다."}

    except Exception as e:
        print(f"얼굴 등록 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"서버 오류가 발생했습니다: {e}")


@router.post("/detect")
def detect_intruders(
    payload: ImagePayload,
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """
    Base64 인코딩된 이미지를 받아 침입자(화면 주시) 여부를 반환합니다.
    """
    try:
        if ai_service.user_embedding is None:
             raise HTTPException(status_code=404, detail="등록된 사용자 얼굴이 없습니다. 먼저 얼굴을 등록해주세요.")

        frame = base64_to_cv2(payload.image)
        result = ai_service.detect_intrusion(frame)
        if "error" in result:
             raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
