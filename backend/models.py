from sqlmodel import SQLModel, Field, Relationship, func
from sqlalchemy import DateTime, Column
from typing import Optional
from datetime import datetime, date
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

class InvoiceStatus(str, Enum):
    """Invoice status options"""
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"

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
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        )
    )
    
    # Relationships
    clients: list["Client"] = Relationship(back_populates="user", cascade_delete=True)
    projects: list["Project"] = Relationship(back_populates='user', cascade_delete=True)
    time_entries: list["TimeEntry"] = Relationship(back_populates='user', cascade_delete=True)
    invoices: list["Invoice"] = Relationship(back_populates="user")  
    
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
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False
        ),
        default=None
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        ),
        default=None
    )  
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates='clients')
    projects: list["Project"] = Relationship(back_populates="client")
    invoices: list["Invoice"] = Relationship(back_populates="client")
    
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
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False
        ),
        default=None
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        ),
        default=None
    ) 
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="projects")
    client: Optional["Client"] = Relationship(back_populates="projects")
    time_entries: list["TimeEntry"] = Relationship(back_populates='project')


class TimeEntry(SQLModel, table=True):
    """
    Tracks time spent on projects.
    Supports both running timers and manual entries.
    """

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    # Ownership
    user_id: UUID = Field(foreign_key="user.id", index=True)
    project_id: UUID = Field(foreign_key="project.id", index=True)
    invoice_id: Optional[UUID] = Field(
        foreign_key="invoice.id",
        default=None,
        index=True
    )

    # Time tracking
    start_time: datetime = Field(index=True)
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None

    description: Optional[str] = Field(default=None, max_length=500)

    # Billing
    is_billable: bool = Field(default=True)
    is_invoiced: bool = Field(default=False)

    # Soft delete
    is_active: bool = Field(default=True)

    # Timestamps
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False
        ),
        default=None
        
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        ),
        default=None
    )

    # Relationships
    user: Optional["User"] = Relationship(back_populates="time_entries")
    project: Optional["Project"] = Relationship(back_populates="time_entries")
    invoice: Optional["Invoice"] = Relationship(back_populates="time_entries")
    

# ============================================
# INVOICE MODELS
# ============================================

# Invoice Table
class Invoice(SQLModel, table=True):
    """
    Invoice for billing clients based on time entries
    """
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    
    # Ownership
    user_id: UUID = Field(foreign_key="user.id", index=True)
    client_id: UUID = Field(foreign_key="client.id", index=True)
    
    # Invoice Details
    invoice_number: str = Field(unique=True, index=True, max_length=50)
    status: InvoiceStatus = Field(default=InvoiceStatus.DRAFT, index=True)
    
    # Dates
    issue_date: date = Field(index=True)
    due_date: date = Field(index=True)
    
    # Financial
    subtotal: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2)
    tax_rate: Decimal = Field(default=Decimal("0.00"), max_digits=5, decimal_places=4)  # e.g., 0.0800 for 8%
    tax_amount: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2)
    total: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2)
    
    # Additional Info
    notes: Optional[str] = Field(default=None, max_length=1000)
    payment_terms: Optional[str] = Field(default="Net 30", max_length=100)
    
    # Soft Delete
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False
        ),
        default=None
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        ),
        default=None
    )
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates="invoices")
    client: Optional["Client"] = Relationship(back_populates="invoices")
    line_items: list["InvoiceLineItem"] = Relationship(
        back_populates="invoice",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    time_entries: list["TimeEntry"] = Relationship(back_populates="invoice")



# InvoiceLineItem Table
class InvoiceLineItem(SQLModel, table=True):
    """
    Individual line items on an invoice
    Usually one per time entry, or grouped by project
    """
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    
    # Foreign Keys
    invoice_id: UUID = Field(foreign_key="invoice.id", index=True)
    time_entry_id: Optional[UUID] = Field(
        default=None,
        foreign_key="timeentry.id",
        index=True
    )
    
    # Line Item Details
    description: str = Field(max_length=500)
    quantity: Decimal = Field(max_digits=10, decimal_places=2)  # Hours
    rate: Decimal = Field(max_digits=10, decimal_places=2)  # Hourly rate
    amount: Decimal = Field(max_digits=10, decimal_places=2)  # quantity × rate
    
    # Timestamps
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False
        ),
        default=None
    )
    
    # Relationships
    invoice: Optional["Invoice"] = Relationship(back_populates="line_items")