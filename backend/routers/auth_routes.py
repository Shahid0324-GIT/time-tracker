from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime, timezone

from auth import verify_password, hash_password, get_current_user, create_access_token
from models import User
from api_types import UserCreate, UserLogin, UserResponse, Token
from db import get_session

# router
router = APIRouter(prefix="/auth", tags=["Authentication"])

# ============================================
# REGISTER NEW USER
# ============================================

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, session:Session=Depends(get_session)):
    
    """Registering a new user"""
    
    # Query
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
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    token = create_access_token(data={"sub": str(new_user.id)})
    
    return Token(access_token=token, token_type="bearer", user=UserResponse(
        id=new_user.id,
        email=new_user.email,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        created_at=new_user.created_at,
        avatar_url=new_user.avatar_url
    ))
    
# ============================================
# LOGIN EXISTING USER
# ============================================

@router.post("/login", response_model=Token)
def login_user(login_data: UserLogin, session:Session=Depends(get_session)):
    """
    Login with email and password
    
    - Finds user by email
    - Verifies password
    - Returns JWT token
    """
    
    statement = select(User).where(User.email == login_data.email)
    user = session.exec(statement=statement).first()
    
    # Check if user exists and password is correct
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
    
    return Token(
        access_token=token,
        token_type="bearer",
        user= UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            created_at=user.created_at,
            avatar_url=user.avatar_url
        )
    )
    
# ============================================
# GET CURRENT USER INFO
# ============================================

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user's information
    
    Requires valid JWT token in Authorization header
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at
    )
    