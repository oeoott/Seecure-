# app/routers/protections.py
# 보호 URL 등록/조회/삭제 라우터

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import app.schemas as schemas
import app.crud as crud
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter()

# 등록된 보호 URL 목록 조회
@router.get("/", response_model=list[schemas.ProtectionOut])
def list_protections(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_protections_by_user(db, current_user.id)

# 보호 URL 등록
@router.post("/", response_model=schemas.ProtectionOut, status_code=status.HTTP_201_CREATED)
def add_protection(
    prot_in: schemas.ProtectionCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_protection(db, current_user.id, prot_in)

# 보호 URL 삭제
@router.delete("/{prot_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_protection(
    prot_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    현재 로그인된 사용자가 소유한 보호 설정을 삭제합니다.
    """
    deleted = crud.delete_protection_by_user(db, prot_id=prot_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="해당 설정이 없거나 삭제할 권한이 없습니다."
        )
    return None
