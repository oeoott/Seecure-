# app/routers/faces.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import app.schemas as schemas, app.crud as crud
import app.models as models  # ⭐️ 누락된 import 구문 추가
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=list[schemas.FaceOut])
def list_faces(current_user=Depends(get_current_user), db=Depends(get_db)):
    return crud.get_faces_by_user(db, current_user.id)

@router.post("/", response_model=schemas.FaceOut, status_code=status.HTTP_201_CREATED)
def add_face(face_in: schemas.FaceCreate, current_user=Depends(get_current_user), db=Depends(get_db)):
    return crud.create_face(db, current_user.id, face_in)

@router.delete("/{face_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_face(face_id: int, current_user=Depends(get_current_user), db=Depends(get_db)):
    # 얼굴 소유권 확인
    face = db.query(models.Face).filter(
        models.Face.id == face_id,
        models.Face.user_id == current_user.id
    ).first()

    if not face:
        raise HTTPException(status_code=404, detail="해당 얼굴 데이터를 찾을 수 없거나 권한이 없습니다.")
    
    crud.delete_face(db, face_id)
