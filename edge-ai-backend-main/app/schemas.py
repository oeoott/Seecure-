# app/schemas.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# 🔽 UserBase 클래스의 email 타입을 EmailStr에서 str으로 변경했습니다.
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True # orm_mode' is renamed to 'from_attributes'

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

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

class ProtectionBase(BaseModel):
    url_pattern: str
    mode: str

class ProtectionCreate(ProtectionBase):
    pass

class ProtectionOut(ProtectionBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- AI/ML Ops Schemas ---

class UrlEventBase(BaseModel):
    url: str
    timestamp: datetime

class UrlEventCreate(UrlEventBase):
    pass

class UrlEventOut(UrlEventBase):
    id: int
    class Config:
        from_attributes = True

class JobOut(BaseModel):
    message: str
    class Config:
        from_attributes = True

class TrainingJobOut(BaseModel):
    id: int
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class OptimizeOut(BaseModel):
    id: int
    path: str
    created_at: datetime
    class Config:
        from_attributes = True

class InferenceIn(BaseModel):
    x_coord: float
    y_coord: float
    url: str

class InferenceOut(BaseModel):
    action: str
    reason: str
