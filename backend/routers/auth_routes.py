from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import Session, select
from datetime import datetime, timezone

from auth import verify_password, hash_password, get_current_user, create_access_token
from models import User
from api_types import UserCreate, UserLogin, UserResponse, Token, PasswordChange
from db import get_session
from config import COOKIE_SECURE, COOKIE_SAMESITE, COOKIE_NAME, COOKIE_MAX_AGE

# router
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(
    response: Response, 
    user_data: UserCreate, 
    session: Session = Depends(get_session)
):
    """Registering a new user"""
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement=statement).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists with this email."
        )
        
    hashed_password = hash_password(user_data.password)
    
    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        hashed_password=hashed_password,
        business_name=user_data.business_name,
        business_address=user_data.business_address,
        tax_id=user_data.tax_id,
        website=user_data.website,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    token = create_access_token(data={"sub": str(new_user.id)})
    
    # Set HttpOnly Cookie
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=COOKIE_MAX_AGE,
        expires=COOKIE_MAX_AGE,
        secure=COOKIE_SECURE,     
        samesite=COOKIE_SAMESITE, 
    )
    
    # Return empty access_token string since it's now in the cookie
    return Token(access_token="", token_type="bearer", user=UserResponse.model_validate(new_user))

@router.post("/login", response_model=Token)
def login_user(
    response: Response,
    login_data: UserLogin, 
    session: Session = Depends(get_session)
):
    """Login with email and password"""
    statement = select(User).where(User.email == login_data.email)
    user = session.exec(statement=statement).first()
    
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    token = create_access_token(data={"sub": str(user.id)})
    
    # Set HttpOnly Cookie
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=COOKIE_MAX_AGE,
        expires=COOKIE_MAX_AGE,
        secure=COOKIE_SECURE,     
        samesite=COOKIE_SAMESITE, 
    )
    
    return Token(
        access_token="", 
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/logout")
def logout_user(response: Response):
    """Logout user by deleting the cookie"""
    response.delete_cookie(
        key=COOKIE_NAME, 
        httponly=True, 
        samesite="lax", 
        secure=False
    )
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's information"""
    return UserResponse.model_validate(current_user)

@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    password_data: PasswordChange,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Verify old password
    if not current_user.hashed_password or not verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    # 2. Check strict equality
    if password_data.old_password == password_data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as the old password"
        )

    # 3. Hash new password and save
    current_user.hashed_password = hash_password(password_data.new_password)
    current_user.updated_at = datetime.now(timezone.utc)
    
    session.add(current_user)
    session.commit()
    
    return {"message": "Password updated successfully"}