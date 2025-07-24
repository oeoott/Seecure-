# app/routers/events.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
import app.schemas as schemas, app.crud as crud
from app.database import get_db
from app.routers.auth import get_current_user

# ⭐️ prefix 제거
router = APIRouter(tags=["events"])

# ⭐️ 경로 수정: "/" -> "/url"
@router.post("/url", response_model=schemas.UrlEventOut, status_code=status.HTTP_201_CREATED)
def add_url_event(evt_in: schemas.UrlEventCreate,
                  current_user=Depends(get_current_user),
                  db: Session = Depends(get_db)):
    return crud.create_url_event(db, current_user.id, evt_in)

# ⭐️ 경로 수정: "/" -> "/url"
@router.get("/url", response_model=list[schemas.UrlEventOut])
def list_url_events(current_user=Depends(get_current_user),
                    db: Session = Depends(get_db)):
    return crud.get_url_events_by_user(db, current_user.id)
