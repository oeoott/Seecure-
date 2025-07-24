# app/routers/ai.py

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.routers.auth import get_current_user
import numpy as np
import cv2

# --- AI 감지 모듈 임포트 ---
# 🔽 여기서 함수 이름을 올바르게 수정했습니다.
from app.detection.face_register import register_face_from_image
from app.detection.gaze_tracker import get_gaze_status

router = APIRouter()

@router.post("/register-face")
async def register_face_endpoint(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    """웹캠에서 캡처한 이미지로 얼굴을 등록합니다."""
    image_bytes = await file.read()
    # 🔽 여기서 함수 이름을 올바르게 수정했습니다.
    result = register_face_from_image(image_bytes)
    
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@router.post("/detect-frame")
async def detect_frame_endpoint(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    """실시간 웹캠 프레임을 분석하여 상태를 반환합니다."""
    image_bytes = await file.read()
    nparr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image data")

    # 참고: 현재는 사용자별 모델 경로를 구분하지 않음 (모든 유저가 동일 파일 공유)
    # 추후 다중 사용자를 지원하려면 사용자 ID별로 경로를 관리해야 함
    USER_FACE_PATH = "app/models/user_face.npy"
    GAZE_REF_PATH = "app/models/user_eye_pos.npy"

    status, intrusion = get_gaze_status(frame, USER_FACE_PATH, GAZE_REF_PATH)

    return {"status": status, "intrusion": intrusion}
