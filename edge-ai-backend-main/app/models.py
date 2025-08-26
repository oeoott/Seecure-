# app/models.py

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)  # 이메일
    hashed_password = Column(String, nullable=False)                 # 비밀번호 해시
    created_at = Column(DateTime, default=datetime.datetime.utcnow)  # 생성일시

    # 관계
    faces = relationship("Face", back_populates="owner")
    gaze_events = relationship("GazeEvent", back_populates="owner")
    protection_settings = relationship("ProtectionSetting", back_populates="owner")

class Face(Base):
    __tablename__ = "faces"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)  
    label = Column(String, nullable=True)                      # 얼굴 라벨
    image_url = Column(Text, nullable=False)                   # 이미지 경로
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="faces")

class GazeEvent(Base):
    __tablename__ = "gaze_events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_time = Column(DateTime, default=datetime.datetime.utcnow)  # 이벤트 시간
    x_coord = Column(Float, nullable=False)                         # X 좌표
    y_coord = Column(Float, nullable=False)                         # Y 좌표
    status = Column(String, nullable=False)                         # 상태
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="gaze_events")

class ProtectionSetting(Base):
    __tablename__ = "protection_settings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    url_pattern = Column(String, nullable=False)      # URL 패턴
    mode = Column(String, nullable=False)             # 보호 모드
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="protection_settings")

class UrlEvent(Base):
    __tablename__ = "url_events"
    id        = Column(Integer, primary_key=True, index=True)
    user_id   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    url       = Column(String, nullable=False)                # URL
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    owner     = relationship("User", back_populates="url_events")

class TrainingJob(Base):
    __tablename__  = "training_jobs"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    status        = Column(String, default="pending")  # 상태 (pending, running, done, failed)
    started_at    = Column(DateTime, nullable=True)
    completed_at  = Column(DateTime, nullable=True)

    owner         = relationship("User", back_populates="training_jobs")

class OptimizedModel(Base):
    __tablename__  = "optimized_models"
    id             = Column(Integer, primary_key=True, index=True)
    training_id    = Column(Integer, ForeignKey("training_jobs.id", ondelete="CASCADE"))
    path           = Column(Text, nullable=False)                 # 모델 경로
    created_at     = Column(DateTime, default=datetime.datetime.utcnow)

    job            = relationship("TrainingJob", back_populates="optimized_model")

# 관계 정의
User.url_events             = relationship("UrlEvent",      back_populates="owner")
User.training_jobs          = relationship("TrainingJob",   back_populates="owner")
TrainingJob.optimized_model = relationship("OptimizedModel", back_populates="job", uselist=False)
