# app/routers/ai.py

from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.routers.auth import get_current_user
import app.crud as crud
import app.schemas as schemas
import os

# --- 🔽 AI 모듈 import ---
# 시선 추적 기능이 제거되었으므로 gaze_tracker는 더 이상 import하지 않습니다.
from app.detection.intrusion_detector import detect_intrusion
from app.detection.face_register import register_user_face

router = APIRouter()

# 사용자별 데이터 저장을 위한 기본 경로 설정
DATA_BASE_PATH = "user_data"
os.makedirs(DATA_BASE_PATH, exist_ok=True)

@router.post("/register-face")
async def api_register_face(
    file: UploadFile = File(...),
    name: str = Form(...),
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(get_current_user)
):
    user_id = current_user.id
    # 사용자별 폴더 생성
    user_folder = os.path.join(DATA_BASE_PATH, str(user_id))
    os.makedirs(user_folder, exist_ok=True)
    
    user_face_path = os.path.join(user_folder, "user_face.npy")
    
    image_bytes = await file.read()

    # 얼굴 등록 시도
    success, message = register_user_face(image_bytes, user_face_path)

    if not success:
        raise HTTPException(status_code=400, detail=message)

    # DB에 얼굴 정보 저장
    face_data = schemas.FaceCreate(label=name, image_url=user_face_path)
    crud.create_face(db, user_id=user_id, face=face_data)
    
    # --- 🔽 TypeError가 발생한 부분을 수정 ---
    # register_user_face가 반환하는 튜플의 두 번째 값(message)을 사용합니다.
    return {"message": message}

@router.post("/detect-frame")
async def api_detect_frame(
    file: UploadFile = File(...),
    current_user: schemas.UserOut = Depends(get_current_user)
):
    user_id = current_user.id
    user_folder = os.path.join(DATA_BASE_PATH, str(user_id))
    user_face_path = os.path.join(user_folder, "user_face.npy")

    image_bytes = await file.read()
    
    # --- 🔽 gaze_tracker를 사용하지 않고 intrusion_detector를 직접 호출 ---
    result = detect_intrusion(image_bytes, user_face_path)
    return result
