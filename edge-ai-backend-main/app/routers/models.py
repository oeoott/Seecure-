# app/routers/models.py
# 모델 학습/최적화 라우터

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
import app.crud as crud
import app.schemas as schemas
from app.routers.auth import get_current_user
import subprocess, os

router = APIRouter(tags=["models"])

# 학습 실행 (백그라운드)
def run_training(job_id: int):
    """
    1) TrainingJob.status = 'running'
    2) scripts/train.py 실행
    3) 완료 시 'completed', 실패 시 'failed'
    """
    db = SessionLocal()
    try:
        job = crud.get_training_job(db, job_id)
        job.status = "running"
        db.commit()

        os.makedirs("models/pth", exist_ok=True)
        subprocess.run(["python", "scripts/train.py"], check=True)

        job.status = "completed"
        db.commit()
    except Exception as e:
        job.status = "failed"
        db.commit()
        print(f"Training failed for job {job_id}: {e}")
    finally:
        db.close()

# 학습 시작
@router.post("/train", response_model=schemas.TrainingJobOut)
def start_training(
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = crud.create_training_job(db, current_user.id)
    background_tasks.add_task(run_training, job.id)
    return job

# 학습 상태 조회
@router.get("/train/{job_id}", response_model=schemas.TrainingJobOut)
def get_training_status(
    job_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    job = crud.get_training_job(db, job_id)
    if not job or job.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# 학습된 모델 최적화 (ONNX 변환)
@router.post("/optimize/{job_id}", response_model=schemas.OptimizeOut)
def optimize_model(
    job_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    job = crud.get_training_job(db, job_id)
    if not job or job.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Training is not completed")
    
    subprocess.run(["python", "scripts/convert_to_onnx.py"], check=True)
    onnx_model_path = "models/onnx/latest.onnx"

    return crud.create_optimized_model(db, training_id=job.id, path=onnx_model_path)
