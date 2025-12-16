from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from sqlmodel import Session, select, desc
from uuid import UUID

from db import get_session
from models import ClientCreate, ClientResponse, ClientUpdate, User, Client
from auth import get_current_user

# router
router = APIRouter(prefix="/clients", tags=["Clients"])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ClientResponse)
def create_client_entry(
    client_data: ClientCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    new_client = Client(
        **client_data.model_dump(),  
        user_id=current_user.id      
    )
    session.add(new_client)
    session.commit()
    session.refresh(new_client)
        
    return new_client

@router.get("/", status_code=status.HTTP_200_OK, response_model=List[ClientResponse])
def get_all_clients(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = select(Client).where(Client.user_id == current_user.id, Client.is_active).order_by(desc(Client.created_at))
    all_clients = session.exec(statement).all()
    
    # NOTE:
        # Pagination (limit/offset or cursor-based) can be added later if the number of
        # clients per user grows. For now, returning the full list keeps the API simple
        # and sufficient for the current scale of the application.
    
    return all_clients

@router.get("/{client_id}", status_code=status.HTTP_200_OK, response_model=ClientResponse)
def get_client(
    client_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = select(Client).where(Client.id == (client_id) , Client.user_id == current_user.id, Client.is_active)
    client = session.exec(statement).first()
    
    if not client:
        raise HTTPException(404, detail="Client not found!")
    
    return client
    
    
@router.patch("/{client_id}", status_code=status.HTTP_200_OK, response_model=ClientResponse)
def update_client(
    client_id: UUID,
    client_updated_data: ClientUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = select(Client).where(Client.id == (client_id) , Client.user_id == current_user.id, Client.is_active == True)
    client = session.exec(statement).first()
    
    if not client:
        raise HTTPException(404, detail="Client not found!")
    
    update_data = client_updated_data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(client, key, value)
        
    session.add(client)
    session.commit()
    session.refresh(client)
    
    return client

@router.delete('/{client_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = select(Client).where(Client.id == (client_id) , Client.user_id == current_user.id, Client.is_active == True)
    client = session.exec(statement).first()
    
    if not client:
        raise HTTPException(404, detail="Client not found!")
    
    client.is_active = False
    
    session.add(client)
    session.commit()
    # session.refresh(client)