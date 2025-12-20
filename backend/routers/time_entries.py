from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from sqlmodel import Session, select, desc
from uuid import UUID
from datetime import datetime, timezone, date, timedelta

from db import get_session
from models import (
    TimeEntry, 
    User, Project, Client
)

from api_types import TimeEntryCreate, TimeEntryManual, TimeEntryUpdate,TimeEntryResponse, TimeEntryWithProject, TimerStartRequest, TimerResponse,ClientResponse, ProjectWithClient
from auth import get_current_user

router = APIRouter(prefix="/time-entries", tags=["Time Entries"])


# ============================================
# HELPER: Calculate Duration
# ============================================

def calculate_duration(start_time: datetime, end_time: Optional[datetime] = None) -> int:
    """Calculate duration in seconds between start and end time"""
    if not end_time:
        end_time = datetime.now(timezone.utc)
    
    delta = end_time - start_time
    return max(0, int(delta.total_seconds()))


# ============================================
# TIMER: START
# ============================================

@router.post("/timer/start", status_code=status.HTTP_201_CREATED, response_model=TimeEntryResponse)
def start_timer(
    timer_data: TimerStartRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Start a timer for a project
    
    - Only one timer can run at a time per user
    - Timer creates a time entry with no end_time
    """
    
    # Check if project exists and belongs to user
    project = session.get(Project, timer_data.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if there's already a running timer
    statement = select(TimeEntry).where(
        TimeEntry.user_id == current_user.id,
        TimeEntry.end_time == (None),
        TimeEntry.is_active == True
    )
    running_timer = session.exec(statement).first()
    
    if running_timer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Timer already running for project {running_timer.project_id}"
        )
    
    # Create timer entry (no end_time)
    timer_entry = TimeEntry(
        user_id=current_user.id,
        project_id=timer_data.project_id,
        description=timer_data.description,
        start_time=datetime.now(timezone.utc),
        end_time=None,  # Timer is running
        duration_seconds=None
    )
    
    session.add(timer_entry)
    session.commit()
    session.refresh(timer_entry)
    
    return timer_entry


# ============================================
# TIMER: STOP
# ============================================

@router.patch("/timer/stop", status_code=status.HTTP_200_OK, response_model=TimeEntryResponse)
def stop_timer(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Stop the currently running timer
    
    - Calculates duration
    - Sets end_time
    """
    
    # Find running timer
    statement = select(TimeEntry).where(
        TimeEntry.user_id == current_user.id,
        TimeEntry.end_time == (None),
        TimeEntry.is_active == True
    )
    timer_entry = session.exec(statement).first()
    
    if not timer_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No running timer found"
        )
    
    # Stop timer
    end_time = datetime.now(timezone.utc)
    timer_entry.end_time = end_time
    timer_entry.duration_seconds = calculate_duration(timer_entry.start_time, end_time)
    
    session.add(timer_entry)
    session.commit()
    session.refresh(timer_entry)
    
    return timer_entry


# ============================================
# TIMER: GET RUNNING
# ============================================

@router.get("/timer/running", status_code=status.HTTP_200_OK, response_model=Optional[TimerResponse])
def get_running_timer(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get currently running timer (if any)
    
    Returns null if no timer is running
    """
    
    statement = select(TimeEntry).where(
        TimeEntry.user_id == current_user.id,
        TimeEntry.end_time == (None),
        TimeEntry.is_active == True
    )
    timer_entry = session.exec(statement).first()
    
    if not timer_entry:
        return None
    
    # Calculate elapsed time
    elapsed = calculate_duration(timer_entry.start_time)
    
    return TimerResponse(
        id=timer_entry.id,
        project_id=timer_entry.project_id,
        description=timer_entry.description,
        start_time=timer_entry.start_time,
        elapsed_seconds=elapsed
    )


# ============================================
# CREATE MANUAL TIME ENTRY (Start + End)
# ============================================

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=TimeEntryResponse)
def create_time_entry(
    entry_data: TimeEntryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Create a manual time entry with start and end time
    
    Duration is calculated automatically
    """
    
    # Verify project belongs to user
    project = session.get(Project, entry_data.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Calculate duration
    duration = calculate_duration(entry_data.start_time, entry_data.end_time)
    
    # Create entry
    new_entry = TimeEntry(
        user_id=current_user.id,
        project_id=entry_data.project_id,
        description=entry_data.description,
        start_time=entry_data.start_time,
        end_time=entry_data.end_time,
        duration_seconds=duration,
        is_billable=entry_data.is_billable
    )
    
    session.add(new_entry)
    session.commit()
    session.refresh(new_entry)
    
    return new_entry


# ============================================
# CREATE MANUAL TIME ENTRY (Start + Duration)
# ============================================

@router.post("/manual", status_code=status.HTTP_201_CREATED, response_model=TimeEntryResponse)
def create_manual_entry(
    entry_data: TimeEntryManual,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Create a manual time entry by specifying duration in seconds
    
    End time is calculated automatically
    """
    
    # Verify project
    project = session.get(Project, entry_data.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Calculate end time from duration
    end_time = entry_data.start_time + timedelta(seconds=entry_data.duration_seconds)
    
    # Create entry
    new_entry = TimeEntry(
        user_id=current_user.id,
        project_id=entry_data.project_id,
        description=entry_data.description,
        start_time=entry_data.start_time,
        end_time=end_time,
        duration_seconds=entry_data.duration_seconds,
        is_billable=entry_data.is_billable
    )
    
    session.add(new_entry)
    session.commit()
    session.refresh(new_entry)
    
    return new_entry


# ============================================
# LIST TIME ENTRIES (With Advanced Filters)
# ============================================

@router.get("/", status_code=status.HTTP_200_OK, response_model=List[TimeEntryWithProject])
def get_time_entries(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    project_id: Optional[UUID] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    is_billable: Optional[bool] = None,
    is_invoiced: Optional[bool] = None,
    limit: int = Query(100, le=500),
    offset: int = 0
):
    """
    Get time entries with filters
    
    Query params:
    - project_id: Filter by project
    - start_date: Filter entries from this date (YYYY-MM-DD)
    - end_date: Filter entries until this date (YYYY-MM-DD)
    - is_billable: Filter billable/non-billable
    - is_invoiced: Filter invoiced/uninvoiced
    - limit: Max results (default 100, max 500)
    - offset: Pagination offset
    """
    
    # Base query
    statement = select(TimeEntry).where(
        TimeEntry.user_id == current_user.id,
        TimeEntry.is_active == True
    )
    
    # Apply filters
    if project_id:
        statement = statement.where(TimeEntry.project_id == project_id)
    
    if start_date:
        start_datetime = datetime.combine(start_date, datetime.min.time()).replace(tzinfo=timezone.utc)
        statement = statement.where(TimeEntry.start_time >= start_datetime)
    
    if end_date:
        end_datetime = datetime.combine(end_date, datetime.max.time()).replace(tzinfo=timezone.utc)
        statement = statement.where(TimeEntry.start_time <= end_datetime)
    
    if is_billable is not None:
        statement = statement.where(TimeEntry.is_billable == is_billable)
    
    if is_invoiced is not None:
        statement = statement.where(TimeEntry.is_invoiced == is_invoiced)
    
    # Order and paginate
    statement = statement.order_by(desc(TimeEntry.start_time)).offset(offset).limit(limit)
    
    entries = session.exec(statement).all()
    
    # Load relationships
    result = []
    for entry in entries:
        entry_dict = TimeEntryWithProject.model_validate(entry).model_dump()
        
        # Load project with client
        if entry.project_id:
            project = session.get(Project, entry.project_id)
            if project:
                project_dict = ProjectWithClient.model_validate(project).model_dump()
                
                # Load client if exists
                if project.client_id:
                    client = session.get(Client, project.client_id)
                    if client:
                        project_dict['client'] = ClientResponse.model_validate(client).model_dump()
                
                entry_dict['project'] = project_dict
        
        result.append(entry_dict)
    
    return result


# ============================================
# GET SINGLE TIME ENTRY
# ============================================

@router.get("/{entry_id}", status_code=status.HTTP_200_OK, response_model=TimeEntryWithProject)
def get_time_entry(
    entry_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a single time entry by ID"""
    
    statement = select(TimeEntry).where(
        TimeEntry.id == entry_id,
        TimeEntry.user_id == current_user.id,
        TimeEntry.is_active == True
    )
    entry = session.exec(statement).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )
    
    # Load project
    entry_dict = TimeEntryWithProject.model_validate(entry).model_dump()
    if entry.project_id:
        project = session.get(Project, entry.project_id)
        if project:
            project_dict = ProjectWithClient.model_validate(project).model_dump()
            if project.client_id:
                client = session.get(Client, project.client_id)
                if client:
                    project_dict['client'] = ClientResponse.model_validate(client).model_dump()
            entry_dict['project'] = project_dict
    
    return entry_dict


# ============================================
# UPDATE TIME ENTRY
# ============================================

@router.patch("/{entry_id}", status_code=status.HTTP_200_OK, response_model=TimeEntryResponse)
def update_time_entry(
    entry_id: UUID,
    entry_data: TimeEntryUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a time entry (cannot update if already invoiced)"""
    
    # Get entry
    statement = select(TimeEntry).where(
        TimeEntry.id == entry_id,
        TimeEntry.user_id == current_user.id,
        TimeEntry.is_active == True
    )
    entry = session.exec(statement).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )
    
    # Can't update invoiced entries
    if entry.is_invoiced:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update invoiced time entries"
        )
    
    # Verify project if being changed
    if entry_data.project_id:
        project = session.get(Project, entry_data.project_id)
        if not project or project.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
    
    # Update fields
    update_data = entry_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(entry, key, value)
    
    # Recalculate duration if times changed
    if entry.start_time and entry.end_time:
        entry.duration_seconds = calculate_duration(entry.start_time, entry.end_time)
    
    session.add(entry)
    session.commit()
    session.refresh(entry)
    
    return entry


# ============================================
# DELETE TIME ENTRY
# ============================================

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_time_entry(
    entry_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Soft delete a time entry (cannot delete if invoiced)"""
    
    statement = select(TimeEntry).where(
        TimeEntry.id == entry_id,
        TimeEntry.user_id == current_user.id,
        TimeEntry.is_active == True
    )
    entry = session.exec(statement).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )
    
    # Can't delete invoiced entries
    if entry.is_invoiced:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete invoiced time entries"
        )
    
    # Soft delete
    entry.is_active = False
    
    session.add(entry)
    session.commit()