from sqlalchemy.orm import Session
from passlib.context import CryptContext
import app.models as models
import app.schemas as schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- User CRUD ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed = pwd_context.hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Face CRUD ---
def get_faces_by_user(db: Session, user_id: int):
    return db.query(models.Face).filter(models.Face.user_id == user_id).all()

# --- 🔽 여기가 수정된 부분입니다 ---
# face 파라미터의 타입을 schemas.FaceCreate로 명확히 지정합니다.
def create_face(db: Session, user_id: int, face: schemas.FaceCreate):
    db_face = models.Face(user_id=user_id, label=face.label, image_url=face.image_url)
    db.add(db_face)
    db.commit()
    db.refresh(db_face)
    return db_face

def delete_face(db: Session, face_id: int):
    face = db.query(models.Face).get(face_id)
    if face:
        db.delete(face)
        db.commit()

# --- Protection CRUD ---
def get_protections_by_user(db: Session, user_id: int):
    return db.query(models.ProtectionSetting).filter(models.ProtectionSetting.user_id == user_id).all()

def create_protection(db: Session, user_id: int, prot: schemas.ProtectionCreate):
    db_prot = models.ProtectionSetting(user_id=user_id, url_pattern=prot.url_pattern, mode=prot.mode)
    db.add(db_prot)
    db.commit()
    db.refresh(db_prot)
    return db_prot

def delete_protection_by_user(db: Session, prot_id: int, user_id: int):
    prot = db.query(models.ProtectionSetting).filter(
        models.ProtectionSetting.id == prot_id,
        models.ProtectionSetting.user_id == user_id
    ).first()
    
    if prot:
        db.delete(prot)
        db.commit()
        return True
    return False

# --- Event/Job/Model CRUD (기존과 동일) ---
def create_url_event(db: Session, user_id: int, evt: schemas.UrlEventCreate):
    db_evt = models.UrlEvent(
        user_id=user_id,
        url=evt.url,
        timestamp=evt.timestamp
    )
    db.add(db_evt)
    db.commit()
    db.refresh(db_evt)
    return db_evt

def get_url_events_by_user(db: Session, user_id: int):
    return db.query(models.UrlEvent).filter(models.UrlEvent.user_id == user_id).all()

def create_training_job(db: Session, user_id: int):
    job = models.TrainingJob(user_id=user_id, status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

def get_training_job(db: Session, job_id: int):
    return db.query(models.TrainingJob).get(job_id)

def create_optimized_model(db: Session, training_id: int, path: str):
    opt = models.OptimizedModel(training_id=training_id, path=path)
    db.add(opt)
    db.commit()
    db.refresh(opt)
    return opt
