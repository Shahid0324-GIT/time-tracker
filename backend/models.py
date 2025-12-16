from sqlmodel import SQLModel, Field, Relationship
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
import uuid


# ============================================
# DATABASE MODELS (SQLModel with table=True)
# ============================================

# User Table
class User(SQLModel, table=True):
    """Database table for users"""
    # Primary key
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Basic info
    email: str = Field(index=True, unique=True)
    first_name: str = Field(max_length=50)
    last_name: str = Field(max_length=50)
    
    # Auth fields
    hashed_password: Optional[str] = None  
    
    # OAuth fields (for Google/GitHub login later)
    oauth_provider: Optional[str] = None  
    oauth_id: Optional[str] = None        
    avatar_url: Optional[str] = None      
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)}
    ) 
    
    # Clients
    clients: list["Client"] = Relationship(back_populates="user")
    
# Client Table
class Client(SQLModel, table=True):
    """
    Database table for client. 
    It will have a one to many relationship with a User.
    A user can have multiple clients.
    """
    
    # Primary Key and Foreign key for relations
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    
    # Client Details
    email: Optional[str] = Field(index=True, default=None)
    name: str = Field(max_length=50)
    company: Optional[str] = Field(max_length=50)
    is_active: bool = Field(default=True)
    
    # Notes
    notes: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)}
    )   
    
    # User
    user: Optional[User] = Relationship(back_populates='clients')
    
    
# ============================================
# API MODELS (Pydantic BaseModel)
# ============================================

# User
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
        from_attributes = True  

# Token
class Token(BaseModel):
    """Response body after successful authentication"""
    access_token: str
    token_type: str
    user: UserResponse
    
# Client
class ClientCreate(BaseModel):
    """Request body for creating a Client"""
    name: str
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    """Request body for updating a Client (All fields optional)"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class ClientResponse(BaseModel):
    """Response body for Client data"""
    id: uuid.UUID
    name: str
    email: Optional[str] = None  # Must match DB optionality
    company: Optional[str] = None
    is_active: bool
    created_at: datetime
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True