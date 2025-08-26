# app/routers/ai.py
# 얼굴 등록/탐지용 AI 라우터

from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np
import cv2

# InsightFace 기반 서비스
from app.detection.ai_service_insightface import AIService

router = APIRouter()
svc = AIService()

@router.post("/register-face")
async def register_face(file: UploadFile = File(...)):
    """
    업로드된 이미지에서 가장 큰 얼굴 1개를 추출하여 임베딩 등록
    """
    data = await file.read()
    arr = np.frombuffer(data, dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image")
    ok = svc.register_face(frame)
    return {"success": ok}

@router.post("/detect-frame")
async def detect_frame(file: UploadFile = File(...)):
    """
    업로드된 이미지에서 침입자 여부 판별
    반환: {"intruder_alert": True|False}
    """
    data = await file.read()
    arr = np.frombuffer(data, dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image")
    return svc.detect_intrusion(frame)

@router.get("/debug/providers")
def debug_providers():
    """
    디버그: ONNX Runtime에서 사용 가능한 EP 목록 조회
    """
    try:
        import onnxruntime as ort
        return {"available": ort.get_available_providers()}
    except Exception as e:
        return {"available": [], "error": str(e)}
