from pydantic import BaseModel, EmailStr, ConfigDict, model_validator, computed_field, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal
from models import ProjectStatus, InvoiceStatus

# ============================================
# USER & AUTH
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
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    """Response body after successful authentication"""
    access_token: str
    token_type: str
    user: UserResponse

# ============================================
# CLIENTS
# ============================================

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
    email: Optional[str] = None 
    company: Optional[str] = None
    is_active: bool
    created_at: datetime
    notes: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# ============================================
# PROJECTS
# ============================================

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

# ============================================
# TIME ENTRIES
# ============================================

class TimeEntryCreate(BaseModel):
    """Request body for creating a COMPLETED manual time entry"""
    project_id: UUID
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    is_billable: bool = True
    
    @model_validator(mode='after')
    def check_times(self):
        if self.start_time >= self.end_time:
            raise ValueError('End time must be after start time')
        return self
    
class TimeEntryManual(BaseModel):
    """Request body for manual time entry (with duration instead of end_time)"""
    project_id: UUID
    description: Optional[str] = None
    start_time: datetime
    duration_seconds: int  
    is_billable: bool = True

class TimeEntryUpdate(BaseModel):
    """Request body for updating a time entry"""
    project_id: Optional[UUID] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    is_billable: Optional[bool] = None
    
    @model_validator(mode='after')
    def check_times(self):
        if self.start_time and self.end_time:
            if self.end_time <= self.start_time:
                raise ValueError('End time must be after start time')
        return self

class TimeEntryResponse(BaseModel):
    """Response body for time entry data"""
    id: UUID
    user_id: UUID
    project_id: UUID
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    is_billable: bool
    is_invoiced: bool
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
    
    @computed_field
    @property
    def computed_duration(self) -> int:
        """Calculate duration if not stored"""
        # Explicitly check for None so that 0 seconds is treated as a valid duration
        if self.duration_seconds is not None:
            return self.duration_seconds
        
        if self.end_time and self.start_time:
            delta = self.end_time - self.start_time
            return int(delta.total_seconds())
        
        return 0

class TimeEntryWithProject(TimeEntryResponse):
    """Time entry with project and client details"""
    project: Optional[ProjectWithClient] = None
    
    model_config = ConfigDict(from_attributes=True)

class TimerStartRequest(BaseModel):
    """Request to start a timer"""
    project_id: UUID
    description: Optional[str] = None

class TimerResponse(BaseModel):
    """Response for running timer"""
    id: UUID
    project_id: UUID
    description: Optional[str] = None
    start_time: datetime
    elapsed_seconds: int
    
    model_config = ConfigDict(from_attributes=True)

# ============================================
# INVOICES
# ============================================

class InvoiceLineItemResponse(BaseModel):
    """Response for invoice line item"""
    id: UUID
    invoice_id: UUID
    time_entry_id: Optional[UUID] = None
    description: str
    quantity: Decimal
    rate: Decimal
    amount: Decimal
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class InvoiceCreate(BaseModel):
    """Request to create/generate an invoice"""
    client_id: UUID
    time_entry_ids: List[UUID]
    issue_date: date
    due_date: date
    tax_rate: Decimal = Decimal("0.00")
    notes: Optional[str] = None
    payment_terms: str = "Net 30"

class InvoiceUpdate(BaseModel):
    """Update invoice details"""
    status: Optional[InvoiceStatus] = None
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    tax_rate: Optional[Decimal] = None
    notes: Optional[str] = None
    payment_terms: Optional[str] = None

class InvoiceResponse(BaseModel):
    """Invoice response"""
    id: UUID
    user_id: UUID
    client_id: UUID
    invoice_number: str
    status: InvoiceStatus
    issue_date: date
    due_date: date
    subtotal: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    total: Decimal
    notes: Optional[str] = None
    payment_terms: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class InvoiceWithDetails(InvoiceResponse):
    """Invoice with client and line items"""
    client: Optional[ClientResponse] = None
    line_items: List[InvoiceLineItemResponse] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)