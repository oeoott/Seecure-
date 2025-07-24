from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

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
        orm_mode = True

class ProtectionBase(BaseModel):
    url_pattern: str
    mode: str

class ProtectionCreate(ProtectionBase):
    pass

class ProtectionOut(ProtectionBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

from datetime import datetime
from pydantic import BaseModel

# 1) URL 이벤트
class UrlEventBase(BaseModel):
    url: str
    timestamp: datetime

class UrlEventCreate(UrlEventBase):
    pass

class UrlEventOut(UrlEventBase):
    id: int
    class Config:
        orm_mode = True

# 2) 배치 전처리 잡 결과
class JobOut(BaseModel):
    message: str
    class Config:
        orm_mode = True

# 3) 모델 학습 상태
class TrainingJobOut(BaseModel):
    id: int
    status: str
    started_at: datetime | None
    completed_at: datetime | None
    class Config:
        orm_mode = True

# 4) 모델 최적화 결과
class OptimizeOut(BaseModel):
    id: int
    path: str
    created_at: datetime
    class Config:
        orm_mode = True

# 5) 실시간 인퍼런스 입출력
class InferenceIn(BaseModel):
    x_coord: float
    y_coord: float
    url: str

class InferenceOut(BaseModel):
    action: str
    reason: str
