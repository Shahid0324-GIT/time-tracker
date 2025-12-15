from sqlmodel import SQLModel, Field
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
import uuid

# ============================================
# DATABASE MODEL (SQLModel with table=True)
# ============================================

class User(SQLModel, table=True):
    """Database table for users"""
    # Primary key
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Basic info
    email: EmailStr = Field(index=True, unique=True)
    first_name: str = Field(max_length=50)
    last_name: str = Field(max_length=50)
    
    # Auth fields
    hashed_password: Optional[str] = None  # None for OAuth users
    
    # OAuth fields (for Google/GitHub login later)
    oauth_provider: Optional[str] = None  # "google" | "github" | None
    oauth_id: Optional[str] = None        # User's ID from OAuth provider
    avatar_url: Optional[str] = None      # Profile picture URL
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============================================
# API MODELS (Pydantic BaseModel)
# ============================================

class UserCreate(BaseModel):
    """Request body for user registration"""
    email: EmailStr
    first_name: str
    last_name: str
    password: str


class UserLogin(BaseModel):
    """Request body for user login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Response body for user data (no sensitive info)"""
    id: uuid.UUID
    email: EmailStr
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True  # Allows conversion from SQLModel


class Token(BaseModel):
    """Response body after successful authentication"""
    access_token: str
    token_type: str
    user: UserResponse