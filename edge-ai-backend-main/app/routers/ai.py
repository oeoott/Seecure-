# app/routers/ai.py

# 🔽 Form을 fastapi에서 import 하도록 수정
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from sqlalchemy.orm import Session
import cv2
import numpy as np
import os

from app.database import get_db
from app.routers.auth import get_current_user
import app.schemas as schemas

# AI 모듈 import
from app.detection.face_register import register_user_face
from app.detection.gaze_tracker import GazeTracker
from app.detection.intrusion_detector import detect_intrusion_from_image

router = APIRouter()

# GazeTracker는 상태를 유지해야 하므로 전역 인스턴스로 생성
# 실제 프로덕션 환경에서는 사용자별로 인스턴스를 관리해야 할 수 있음
gaze_tracker = GazeTracker()

@router.post("/register-face")
async def register_face_endpoint(
    # FormData에서 'name' 필드를 가져옴
    name: str = Form(...),
    # FormData에서 'image' 파일 필드를 가져옴
    image: UploadFile = File(...),
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """
    프론트엔드에서 받은 웹캠 이미지와 이름을 사용하여 얼굴을 등록합니다.
    """
    try:
        # 이미지 파일을 읽어서 OpenCV 형식으로 변환
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 사용자별로 고유한 파일 경로 생성
        user_id = current_user.id
        save_dir = f"app/models/user_{user_id}"
        os.makedirs(save_dir, exist_ok=True)
        
        face_path = os.path.join(save_dir, "user_face.npy")
        eye_pos_path = os.path.join(save_dir, "user_eye_pos.npy")
        yolo_model_path = "app/models/yolov8n-face.onnx"

        # 얼굴 등록 함수 호출
        success, message = register_user_face(frame, face_path, eye_pos_path, yolo_model_path)

        if success:
            return {"message": message}
        else:
            raise HTTPException(status_code=400, detail=message)

    except Exception as e:
        # 기타 에러 처리
        raise HTTPException(status_code=500, detail=f"얼굴 등록 중 서버 오류 발생: {str(e)}")


@router.post("/detect-frame")
async def detect_frame_endpoint(
    image: UploadFile = File(...),
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """
    프론트엔드에서 받은 실시간 웹캠 프레임을 분석하여 상태를 반환합니다.
    """
    try:
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 사용자별 모델 경로 설정
        user_id = current_user.id
        user_model_dir = f"app/models/user_{user_id}"
        user_face_path = os.path.join(user_model_dir, "user_face.npy")
        user_eye_pos_path = os.path.join(user_model_dir, "user_eye_pos.npy")
        yolo_model_path = "app/models/yolov8n-face.onnx"

        # 사용자 데이터 존재 여부 확인
        if not os.path.exists(user_face_path) or not os.path.exists(user_eye_pos_path):
            return {"status": "error", "message": "등록된 사용자 얼굴 정보가 없습니다."}

        # 시선 추적 및 타인 감지
        is_forward = gaze_tracker.track_gaze(frame, user_eye_pos_path)
        is_intrusion = detect_intrusion_from_image(frame, user_face_path, yolo_model_path)

        # 상태 결정
        status = "정상"
        if is_intrusion:
            status = "타인 감지"
        elif not is_forward:
            status = "시선 이탈"

        return {"status": status}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}
