# app/routers/ai.py

from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.routers.auth import get_current_user
import app.schemas as schemas

# --- 🔽 여기가 수정된 부분입니다 ---
# 잘못된 함수 이름(register_face_from_image)을 올바른 이름으로 변경합니다.
from app.detection.face_register import register_user_face
from app.detection.gaze_tracker import analyze_frame_for_gaze

router = APIRouter()

@router.post("/register-face")
async def register_face_endpoint(
    current_user: schemas.UserOut = Depends(get_current_user),
    file: UploadFile = File(...),
    name: str = Form(...) # 프론트엔드에서 보낸 'name' 값
):
    """
    웹캠 이미지를 받아 사용자의 얼굴을 등록합니다.
    """
    try:
        image_bytes = await file.read()
        # 사용자 ID를 전달하여 개인별 데이터를 저장하도록 합니다.
        register_user_face(image_bytes=image_bytes, user_id=str(current_user.id))
        return {"message": f"'{name}' 님의 얼굴이 성공적으로 등록되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/detect-frame")
async def detect_frame_endpoint(
    current_user: schemas.UserOut = Depends(get_current_user),
    file: UploadFile = File(...)
):
    """
    실시간 웹캠 프레임을 받아 분석하고 상태를 반환합니다.
    """
    try:
        image_bytes = await file.read()
        # 사용자 ID를 전달하여 개인별 데이터를 사용하도록 합니다.
        status = analyze_frame_for_gaze(image_bytes=image_bytes, user_id=str(current_user.id))
        return {"status": status}
    except Exception as e:
        # 실제 운영 환경에서는 더 구체적인 에러 처리가 필요합니다.
        # print(f"Detection error: {e}") # 디버깅용
        return {"status": "error"}
