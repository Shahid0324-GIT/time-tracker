from sqlmodel import SQLModel, Field, Relationship, func
from sqlalchemy import DateTime, Column
from typing import Optional
from datetime import datetime
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
    clients: list["Client"] = Relationship(back_populates="user", cascade_delete=True)
    
    # Projects
    projects: list["Project"] = Relationship(back_populates='user', cascade_delete=True)
    
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

    