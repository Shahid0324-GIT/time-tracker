from datetime import datetime, timedelta, timezone
from typing import Optional, cast
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from models import User
import os
from dotenv import load_dotenv
from db import get_session

# Load environment variables
load_dotenv(".env.development")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

if not SECRET_KEY or SECRET_KEY is None:
    raise ValueError("SECRET_KEY env is mission or not set.")

SECRET_KEY = cast(str, SECRET_KEY)

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer token scheme for FastAPI
security = HTTPBearer()

def hash_password(password:str) -> str:
    """Hashing the users password before storing it in the db"""
    return pwd_context.hash(password)

def verify_password(password:str, hashed_password:str) -> bool:
    """Verifying the user's password"""
    return pwd_context.verify(password, hashed_password)


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
# DEPENDENCY: GET CURRENT USER
# ============================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Extract token from Authorization header
        token = credentials.credentials
        
        # Decode JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])# type: ignore
        user_id: str | None = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Get user from database
    user = session.get(User, user_id)
    
    if user is None:
        raise credentials_exception
    
    return user