# app/crud.py

from sqlalchemy.orm import Session
from passlib.context import CryptContext
import app.models as models
import app.schemas as schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed = pwd_context.hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed)
    db.add(db_user); db.commit(); db.refresh(db_user)
    return db_user

def get_faces_by_user(db: Session, user_id: int):
    return db.query(models.Face).filter(models.Face.user_id == user_id).all()

def create_face(db: Session, user_id: int, face: schemas.FaceCreate):
    db_face = models.Face(user_id=user_id, label=face.label, image_url=face.image_url)
    db.add(db_face); db.commit(); db.refresh(db_face)
    return db_face

def delete_face(db: Session, face_id: int):
    face = db.query(models.Face).get(face_id)
    if face:
        db.delete(face); db.commit()

def get_protections_by_user(db: Session, user_id: int):
    return db.query(models.ProtectionSetting).filter(models.ProtectionSetting.user_id == user_id).all()

def create_protection(db: Session, user_id: int, prot: schemas.ProtectionCreate):
    db_prot = models.ProtectionSetting(user_id=user_id, url_pattern=prot.url_pattern, mode=prot.mode)
    db.add(db_prot); db.commit(); db.refresh(db_prot)
    return db_prot

def delete_protection_by_id_and_owner(db: Session, prot_id: int, user_id: int):
    """
    ID와 소유자 ID가 모두 일치하는 보호 설정을 찾아서 삭제합니다.
    성공적으로 삭제하면 True, 대상이 없으면 False를 반환합니다.
    """
    prot_to_delete = db.query(models.ProtectionSetting).filter(
        models.ProtectionSetting.id == prot_id,
        models.ProtectionSetting.user_id == user_id
    ).first()

    if prot_to_delete:
        db.delete(prot_to_delete)
        db.commit()
        return True  # 삭제 성공
    return False # 삭제할 대상 없음

def create_url_event(db: Session, user_id: int, evt: schemas.UrlEventCreate):
    db_evt = models.UrlEvent(
        user_id=user_id,
        url=evt.url,
        timestamp=evt.timestamp
    )
    db.add(db_evt); db.commit(); db.refresh(db_evt)
    return db_evt

def get_url_events_by_user(db: Session, user_id: int):
    return db.query(models.UrlEvent).filter(models.UrlEvent.user_id == user_id).all()

# 배치 전처리 잡 생성·상태 조회

def create_training_job(db: Session, user_id: int):
    job = models.TrainingJob(user_id=user_id, status="pending")
    db.add(job); db.commit(); db.refresh(job)
    return job

def get_training_job(db: Session, job_id: int):
    return db.query(models.TrainingJob).get(job_id)

# 최적화 모델 생성

def create_optimized_model(db: Session, training_id: int, path: str):
    opt = models.OptimizedModel(training_id=training_id, path=path)
    db.add(opt); db.commit(); db.refresh(opt)
    return opt
