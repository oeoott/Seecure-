# app/routers/protections.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import app.schemas as schemas
import app.crud as crud
import app.models as models
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=list[schemas.ProtectionOut])
def list_protections(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_protections_by_user(db, current_user.id)

@router.post("/", response_model=schemas.ProtectionOut, status_code=status.HTTP_201_CREATED)
def add_protection(prot_in: schemas.ProtectionCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_protection(db, current_user.id, prot_in)

# 🔽 기존 remove_protection 함수를 아래 내용으로 교체합니다.
@router.delete("/{prot_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_protection(prot_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """
    현재 로그인된 사용자가 소유한 보호 설정을 삭제합니다.
    """
    deleted = crud.delete_protection_by_user(db, prot_id=prot_id, user_id=current_user.id)
    
    # crud 함수가 False를 반환했다면 (삭제 대상이 없거나 권한이 없는 경우)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="해당 설정이 없거나 삭제할 권한이 없습니다."
        )
    # 성공 시 (204 No Content)에는 아무것도 반환하지 않습니다.
