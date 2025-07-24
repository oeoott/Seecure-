from fastapi import APIRouter

router = APIRouter(tags=["inference"])

@router.get("/status")
def inference_status():
    return {"message": "Inference router is active, but the /infer endpoint is disabled as it requires a model file generated from the training pipeline."}