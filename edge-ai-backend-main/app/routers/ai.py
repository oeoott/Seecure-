# app/routers/ai.py
from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np
import cv2

# ✅ 여기만 바뀝니다: InsightFace 기반 서비스 사용
from app.detection.ai_service_insightface import AIService

router = APIRouter()
svc = AIService()


@router.post("/register-face")
async def register_face(file: UploadFile = File(...)):
    """
    폼데이터의 이미지 파일(웹캠 캡쳐 프레임 등)을 받아
    가장 큰 얼굴 1개로 임베딩을 등록합니다.
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
    폼데이터의 이미지 파일을 받아 침입자 여부를 판별합니다.
    반환: {"intruder_alert": True|False} 또는 {"error": "..."}
    """
    data = await file.read()
    arr = np.frombuffer(data, dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image")
    result = svc.detect_intrusion(frame)
    return result


# (옵션) 심사용/디버그용: 현재 사용 가능한 EP 목록 확인
@router.get("/debug/providers")
def debug_providers():
    try:
        import onnxruntime as ort
        return {"available": ort.get_available_providers()}
    except Exception as e:
        return {"available": [], "error": str(e)}
