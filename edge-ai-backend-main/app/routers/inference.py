# app/routers/inference.py
# 추론 라우터 (모델 파일 필요, 현재 /infer 비활성화)

from fastapi import APIRouter

router = APIRouter(tags=["inference"])

@router.get("/status")
def inference_status():
    return {
        "message": (
            "Inference router is active, but the /infer endpoint is disabled "
            "as it requires a model file generated from the training pipeline."
        )
    }
