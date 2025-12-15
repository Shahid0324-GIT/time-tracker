from datetime import datetime, timedelta, timezone
from typing import Optional, cast
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from models import User
from db import get_session
import uuid

# OAuth
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config

# Config
from config import *


if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
    print("Warning: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing. Google OAuth will not work.")

if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
    print("Warning: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET missing. GitHub OAuth will not work.")

# OAuth config
config = Config('.env')
oauth = OAuth(config)

# Registering Google OAuth client (only if creds present)
if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    oauth.register(
        name='google',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile',
            'prompt': 'select_account',
        }
    )

# Register GitHub OAuth (only if creds present)
if GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET:
    oauth.register(
        name='github',
        client_id=GITHUB_CLIENT_ID,
        client_secret=GITHUB_CLIENT_SECRET,
        authorize_url='https://github.com/login/oauth/authorize',
        authorize_params=None,
        access_token_url='https://github.com/login/oauth/access_token',
        access_token_params=None,
        client_kwargs={'scope': 'user:email'},
    )




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

def verify_password(plain_password:str, hashed_password:str) -> bool:
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
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
        user_id: str | None = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Get user from database
    user = session.get(User, uuid.UUID(user_id))
    
    if user is None:
        raise credentials_exception
    
    return user

# OAuth create/get
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
    
    Args:
        session: Database session
        email: User email from OAuth provider
        name: User full name from OAuth provider
        oauth_provider: "google" or "github"
        oauth_id: User's ID from OAuth provider
        avatar_url: Profile picture URL
    
    Returns:
        User object
    """
    # Check if user exists by OAuth ID
    statement = select(User).where(
        User.oauth_provider == oauth_provider,
        User.oauth_id == oauth_id
    )
    user = session.exec(statement).first()
    
    if user:
        # User exists, return it
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
    # Split name into first and last
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
        hashed_password=None  # OAuth users don't have passwords
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user