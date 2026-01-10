from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
import uuid

from sqlmodel import Session, select
from models import User
from db import get_session

# Config
from config import *

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hashing the users password before storing it in the db"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifying the user's password"""
    return pwd_context.verify(plain_password, hashed_password)


# ============================================
# JWT TOKEN FUNCTIONS
# ============================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT token
    
    Args:
        data: Data to encode in token (usually {"sub": user_id})
        expires_delta: Optional custom expiration time
    
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) # type: ignore
    
    return encoded_jwt

# ============================================
# COOKIE EXTRACTION
# ============================================

def get_token_from_cookie(request: Request) -> str:
    """
    Extracts the JWT token from the httpOnly cookie.
    """
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return token

# ============================================
# DEPENDENCY: GET CURRENT USER
# ============================================

async def get_current_user(
    token: str = Depends(get_token_from_cookie),
    session: Session = Depends(get_session)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token found in cookie
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
        user_id: str | None = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Get user from database
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise credentials_exception

    user = session.get(User, user_uuid)
    
    if user is None:
        raise credentials_exception
    
    return user

# ============================================
# OAUTH HELPERS
# ============================================

def get_or_create_oauth_user(
    session: Session,
    email: str,
    name: str,
    oauth_provider: str,
    oauth_id: str,
    avatar_url: str | None = None
) -> User:
    """
    Find existing OAuth user or create new one
    """
    # Check if user exists by OAuth ID
    statement = select(User).where(
        User.oauth_provider == oauth_provider,
        User.oauth_id == oauth_id
    )
    user = session.exec(statement).first()
    
    if user:
        return user
    
    # Check if user exists by email (link accounts)
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if user:
        # User exists with this email, link OAuth account
        user.oauth_provider = oauth_provider
        user.oauth_id = oauth_id
        if avatar_url:
            user.avatar_url = avatar_url
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
    
    # Create new user
    name_parts = name.split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ''
    
    user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
        oauth_provider=oauth_provider,
        oauth_id=oauth_id,
        avatar_url=avatar_url,
        hashed_password=None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        is_verified=True
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user