from sqlmodel import SQLModel, Field, Relationship, func
from sqlalchemy import DateTime, Column
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime, timezone
from uuid import UUID, uuid4
from enum import Enum
from decimal import Decimal

# ============================================
# ENUMS
# ============================================

class ProjectStatus(str, Enum):
    """Project status options"""
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


# ============================================
# DATABASE MODELS (SQLModel with table=True)
# ============================================

# User Table
class User(SQLModel, table=True):
    """Database table for users"""
    # Primary key
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    
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
    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        ),
    )

    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        ),
    )
    
    # Clients
    clients: list["Client"] = Relationship(back_populates="user")
    
    # Projects
    projects: list["Project"] = Relationship(back_populates='user')
    
# Client Table
class Client(SQLModel, table=True):
    """
    Database table for client. 
    It will have a one to many relationship with a User.
    A user can have multiple clients.
    """
    
    # Primary Key and Foreign key for relations
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    
    # Client Details
    email: Optional[str] = Field(index=True, default=None)
    name: str = Field(max_length=50)
    company: Optional[str] = Field(max_length=50)
    is_active: bool = Field(default=True)
    
    # Notes
    notes: Optional[str] = Field(default=None, max_length=400)
    
    # Timestamps
    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        ),
    )

    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        ),
    )  
    
    # User
    user: Optional["User"] = Relationship(back_populates='clients')
    
    # projects
    projects: list["Project"] = Relationship(back_populates="client")
    
# Projects
class Project(SQLModel, table=True):
    
    """
    Database table for projects.
    A project belongs to a user and optionally to a client.
    Time entries are tracked against projects.
    """
    
    # Primary key
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    
    # Foreign Keys
    user_id : UUID = Field(foreign_key="user.id", index=True)
    client_id : Optional[UUID] = Field(foreign_key="client.id", default=None, index=True)
    
    # Project details
    name: str = Field(max_length=160)
    description: Optional[str] = Field(default=None, max_length=500)
    
    # Financial
    hourly_rate: Decimal = Field(
        default=Decimal("0.00"),
        max_digits=10,
        decimal_places=2
    )
    currency: str = Field(default="USD", max_length=3)
    budget_hours: Optional[Decimal] = Field(
        default=None,
        max_digits=10,
        decimal_places=2
    )
    
    # Status & Organization
    status: ProjectStatus = Field(default=ProjectStatus.ACTIVE)
    color: str = Field(default="#3B82F6", max_length=7)  # Hex color
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: Optional[datetime] | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        ),
    )

    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        ),
    ) 
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="projects")
    client: Optional["Client"] = Relationship(back_populates="projects")
    
    
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
    