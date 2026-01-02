from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from db import get_session
from auth import get_current_user
from models import User
from api_types import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])

# ============================================
# UPDATE USER PROFILE (PATCH)
# ============================================
@router.patch("/me", response_model=UserResponse)
def update_user_me(
    user_update: UserUpdate, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    """
    Update the current logged-in user's profile.
    Only updates fields that are provided (not None).
    """
    
    # 1. Update fields if provided
    user_data = user_update.model_dump(exclude_unset=True)
    
    if "email" in user_data and user_data["email"] != current_user.email:
        return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="UnAuthorised")

    for key, value in user_data.items():
        setattr(current_user, key, value)

    # 2. Save to DB
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return current_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Permanently delete the authenticated user and all associated data.
    """
    try:
        session.delete(current_user)
        session.commit()
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to delete account"
        )
    
    return None