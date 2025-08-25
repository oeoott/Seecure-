# app/schemas.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# --- User ---
class UserBase(BaseModel):
    email: str  # 기본 사용자 이메일

class UserCreate(UserBase):
    password: str  # 비밀번호

class UserOut(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Face ---
class FaceBase(BaseModel):
    label: Optional[str] = None

class FaceCreate(FaceBase):
    image_url: str

class FaceOut(FaceBase):
    id: int
    image_url: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- Protection ---
class ProtectionBase(BaseModel):
    url_pattern: str  # URL 패턴
    mode: str         # 보호 모드

class ProtectionCreate(ProtectionBase):
    pass

class ProtectionOut(ProtectionBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- URL Event ---
class UrlEventBase(BaseModel):
    url: str
    timestamp: datetime

class UrlEventCreate(UrlEventBase):
    pass

class UrlEventOut(UrlEventBase):
    id: int
    class Config:
        from_attributes = True

# --- Job ---
class JobOut(BaseModel):
    message: str
    class Config:
        from_attributes = True

# --- Training ---
class TrainingJobOut(BaseModel):
    id: int
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Optimized Model ---
class OptimizeOut(BaseModel):
    id: int
    path: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- Inference ---
class InferenceIn(BaseModel):
    x_coord: float
    y_coord: float
    url: str

class InferenceOut(BaseModel):
    action: str   # 수행 동작
    reason: str   # 근거
