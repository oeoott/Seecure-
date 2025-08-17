# app/routers/faces.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import app.schemas as schemas
import app.crud as crud
import app.models as models
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=list[schemas.FaceOut])
def list_faces(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_faces_by_user(db, current_user.id)

@router.post("/", response_model=schemas.FaceOut, status_code=status.HTTP_201_CREATED)
def add_face(
    face_in: schemas.FaceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_face(db, current_user.id, face_in)

@router.delete("/{face_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_face(
    face_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    face = db.query(models.Face).filter(
        models.Face.id == face_id,
        models.Face.user_id == current_user.id
    ).first()

    if not face:
        raise HTTPException(
            status_code=404,
            detail="해당 얼굴 데이터를 찾을 수 없거나 권한이 없습니다."
        )
    
    # crud.delete_face 함수에 user_id를 전달하여 TypeError를 해결
    # crud.delete_face(db, face_id) # <- 기존 코드
    crud.delete_face(db=db, face_id=face_id, user_id=current_user.id) # <- 수정된 코드

    # status_code가 204일 때는 응답 본문을 보내지 않으므로 None을 리턴
    return None
