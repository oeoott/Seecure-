# app/routers/jobs.py

from fastapi import APIRouter, BackgroundTasks
import subprocess, os
from app.database import SessionLocal
import app.crud as crud

# ⭐️ prefix 제거
router = APIRouter(tags=["jobs"])

def run_preprocessing():
    """
    1) DB에서 UrlEvent, GazeEvent 데이터 덤프
    2) 로컬 CSV로 저장
    3) 여러분의 전처리 스크립트(preprocess.py) 호출
    """
    db = SessionLocal()
    # 예: CSV export
    import pandas as pd
    urls = pd.DataFrame([{"url": e.url, "timestamp": e.timestamp}
                         for e in crud.get_url_events_by_user(db, user_id=None)])
    gazes = pd.DataFrame([{"x": e.x_coord, "y": e.y_coord, "status": e.status}
                          for e in crud.get_gaze_events_by_user(db, user_id=None)])
    urls.to_csv("data/urls.csv", index=False)
    gazes.to_csv("data/gazes.csv", index=False)
    db.close()

    # 외부 스크립트 호출 (예: python scripts/preprocess.py --input data/)
    subprocess.run([
        "python", "scripts/preprocess.py",
        "--input-dir", "data",
        "--output-dir", "data/processed"
    ], check=True)

@router.post("/preprocess")
def preprocess_data(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_preprocessing)
    return {"message": "Preprocessing started in background"}
