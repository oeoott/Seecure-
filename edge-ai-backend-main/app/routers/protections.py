# app/routers/protections.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import app.schemas as schemas, app.crud as crud
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter()

# ⭐️ 경로 수정: "/"
@router.get("/", response_model=list[schemas.ProtectionOut])
def list_protections(current_user=Depends(get_current_user), db=Depends(get_db)):
    return crud.get_protections_by_user(db, current_user.id)

# ⭐️ 경로 수정: "/"
@router.post("/", response_model=schemas.ProtectionOut, status_code=status.HTTP_201_CREATED)
def add_protection(prot_in: schemas.ProtectionCreate, current_user=Depends(get_current_user), db=Depends(get_db)):
    return crud.create_protection(db, current_user.id, prot_in)

# ⭐️ 경로 수정: "/{prot_id}"
@router.delete("/{prot_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_protection(prot_id: int, current_user=Depends(get_current_user), db=Depends(get_db)):
    # URL 소유권 확인
    protection = db.query(models.ProtectionSetting).filter(
        models.ProtectionSetting.id == prot_id,
        models.ProtectionSetting.user_id == current_user.id
    ).first()
    if not protection:
        raise HTTPException(status_code=404, detail="해당 설정을 찾을 수 없거나 권한이 없습니다.")
    crud.delete_protection(db, prot_id)
