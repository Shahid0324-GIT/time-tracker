from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from sqlmodel import Session, select, desc
from uuid import UUID

from db import get_session
from models import (
    Project, User, Client, ProjectStatus
)
from auth import get_current_user
from api_types import  ProjectCreate, ProjectUpdate, ProjectResponse, ProjectWithClient,ClientResponse

router = APIRouter(prefix='/projects', tags=["Projects"])

# ============================================
# CREATE PROJECT
# ============================================
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ProjectResponse)
def create_project (
    project_data: ProjectCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new project
    
    - Project belongs to current user
    - Optionally linked to a client
    - Can set hourly rate and budget
    """
    
    # If client_id provided, verify it belongs to current user
    if project_data.client_id:
        client = session.get(Client, project_data.client_id)
        if not client or client.user_id != current_user.id or not client.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found or doesn't belong to you or is not active"
            )
    
    # Create project
    new_project = Project(
        **project_data.model_dump(),
        user_id=current_user.id
    )
    
    session.add(new_project)
    session.commit()
    session.refresh(new_project)
    
    return new_project

# ============================================
# LIST ALL PROJECTS
# ============================================

@router.get("/", status_code=status.HTTP_200_OK, response_model=List[ProjectWithClient])
def get_all_projects(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    status_filter: Optional[ProjectStatus] = None,
    client_id: Optional[UUID] = None,
    include_inactive: bool = False
):
    """
    Get all projects for current user
    
    Query params:
    - status: Filter by project status (active/completed/archived)
    - client_id: Filter by client
    - include_inactive: Include soft-deleted projects
    """
    
    # Base query
    statement = select(Project).where(Project.user_id == current_user.id)
    
    # Apply filters
    if not include_inactive:
        statement = statement.where(Project.is_active == True)
    
    if status_filter:
        statement = statement.where(Project.status == status_filter)
    
    if client_id:
        statement = statement.where(Project.client_id == client_id)
    
    # Order by newest first
    statement = statement.order_by(desc(Project.created_at))
    
    projects = session.exec(statement).all()
    
    # Load client relationships
    result = []
    for project in projects:
        project_dict = ProjectWithClient.model_validate(project).model_dump()
        
        # Add client details if exists
        if project.client_id:
            client = session.get(Client, project.client_id)
            if client:
                project_dict['client'] = ClientResponse.model_validate(client).model_dump()
        
        result.append(project_dict)
    
    return result

# ============================================
# GET SINGLE PROJECT
# ============================================

@router.get("/{project_id}", status_code=status.HTTP_200_OK, response_model=ProjectWithClient)
def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a single project by ID"""
    
    statement = select(Project).where(
        Project.id == project_id,
        Project.user_id == current_user.id,
        Project.is_active == True
    )
    project = session.exec(statement).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Load client if exists
    project_dict = ProjectWithClient.model_validate(project).model_dump()
    if project.client_id:
        client = session.get(Client, project.client_id)
        if client:
            project_dict['client'] = ClientResponse.model_validate(client).model_dump()
    
    return project_dict

# ============================================
# UPDATE PROJECT
# ============================================

@router.patch("/{project_id}", status_code=status.HTTP_200_OK, response_model=ProjectResponse)
def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a project (partial update)"""
    
    # Get project
    statement = select(Project).where(
        Project.id == project_id,
        Project.user_id == current_user.id,
        Project.is_active == True
    )
    project = session.exec(statement).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # If updating client_id, verify it belongs to user
    if project_data.client_id:
        client = session.get(Client, project_data.client_id)
        if not client or client.user_id != current_user.id or not client.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found or doesn't belong to you or is not active."
            )
    
    # Update fields
    update_data = project_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    
    session.add(project)
    session.commit()
    session.refresh(project)
    
    return project


# ============================================
# DELETE PROJECT (Soft Delete)
# ============================================

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Soft delete a project"""
    
    statement = select(Project).where(
        Project.id == project_id,
        Project.user_id == current_user.id,
        Project.is_active == True
    )
    project = session.exec(statement).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Soft delete
    project.is_active = False
    
    session.add(project)
    session.commit()
    

# ============================================
# ARCHIVE/COMPLETE PROJECT
# ============================================

@router.patch("/{project_id}/status", status_code=status.HTTP_200_OK, response_model=ProjectResponse)
def update_project_status(
    project_id: UUID,
    project_status: ProjectStatus,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update project status
    
    Use this to mark projects as completed or archived
    without deleting them
    """
    
    statement = select(Project).where(
        Project.id == project_id,
        Project.user_id == current_user.id,
        Project.is_active == True
    )
    project = session.exec(statement).first()
    
    if not project:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project.status = project_status
    
    session.add(project)
    session.commit()
    session.refresh(project)
    
    return project