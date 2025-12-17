from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime, timezone
from uuid import UUID
from decimal import Decimal
from models import ProjectStatus

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
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = datetime.now(timezone.utc)
    
    model_config = ConfigDict(from_attributes=True)

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
    id: UUID
    name: str
    email: Optional[str] = None  # Must match DB optionality
    company: Optional[str] = None
    is_active: bool
    created_at: datetime
    notes: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# Prjects
class ProjectCreate(BaseModel):
    """Request body for creating a project"""
    name: str
    description: Optional[str] = None
    client_id: Optional[UUID] = None
    hourly_rate: Decimal = Decimal("0.00")
    currency: str = "USD"
    budget_hours: Optional[Decimal] = None
    color: str = "#3B82F6"
    status: ProjectStatus = ProjectStatus.ACTIVE
    
class ProjectUpdate(BaseModel):
    """Request body for updating a project (all fields optional)"""
    name: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[UUID] = None
    hourly_rate: Optional[Decimal] = None
    currency: Optional[str] = None
    budget_hours: Optional[Decimal] = None
    color: Optional[str] = None
    status: Optional[ProjectStatus] = None


class ProjectResponse(BaseModel):
    """Response body for project data"""
    id: UUID
    user_id: UUID
    client_id: Optional[UUID] = None
    name: str
    description: Optional[str] = None
    hourly_rate: Decimal
    currency: str
    budget_hours: Optional[Decimal] = None
    status: ProjectStatus
    color: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ProjectWithClient(ProjectResponse):
    """Project response with client details included"""
    client: Optional[ClientResponse] = None