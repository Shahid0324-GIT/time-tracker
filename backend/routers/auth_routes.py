import json
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi_limiter.depends import RateLimiter
from sqlmodel import Session, select
from datetime import datetime, timezone
from uuid import uuid4

# Local imports
from auth import verify_password, hash_password, get_current_user, create_access_token
from models import User
from api_types import (
    UserCreate, UserLogin, UserResponse, Token, PasswordChange, 
    TokenExchangeRequest, ResetPasswordRequest, ForgotPasswordRequest
)
from db import get_session
from config import COOKIE_SECURE, COOKIE_SAMESITE, COOKIE_NAME, COOKIE_MAX_AGE
from utils.email import send_otp_email, send_password_reset_email
from utils.generate_otp import generate_r_otp
from redis.asyncio import Redis 
from lib.redis_instance import get_redis 

# Router setup
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post(
    "/register", 
    status_code=status.HTTP_200_OK, 
    dependencies=[Depends(RateLimiter(times=3, seconds=60))] 
)
async def register_user(
    user_data: UserCreate, 
    session: Session = Depends(get_session),
    redis_client: Redis = Depends(get_redis)
):
    """
    Step 1: Validate email and send OTP. 
    Does NOT create user in DB yet. Stores temp data in Redis.
    """
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement=statement).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists with this email."
        )

    hashed_pass = hash_password(user_data.password)
    
    user_storage_dict = user_data.model_dump()
    user_storage_dict["password"] = hashed_pass

    otp = generate_r_otp()
    hashed_otp = hash_password(otp)
    
    temp_user_key = f"signup:{user_data.email}"
    
    data_to_store = {
        "user": json.dumps(user_storage_dict), 
        "otp": hashed_otp
    }
    
    await redis_client.hset(temp_user_key, mapping=data_to_store) # type: ignore
    await redis_client.expire(temp_user_key, 600)
    
    await send_otp_email(user_data.email, otp)
    
    return {"message": "Verification code sent to your email", "email": user_data.email}


@router.post("/verify-email", response_model=Token)
async def verify_email(
    response: Response,
    email: str, 
    otp: str, 
    session: Session = Depends(get_session),
    redis_client: Redis = Depends(get_redis)
):
    """
    Step 2: Verify OTP and create user in Postgres.
    """
    temp_user_key = f"signup:{email}"
    
    stored_data = await redis_client.hgetall(temp_user_key)
    
    if not stored_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Verification code expired or invalid email. Please register again."
        )
        
    is_valid_otp = verify_password(otp, stored_data["otp"])
        
    if not is_valid_otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code")
        
    user_dict = json.loads(stored_data["user"])
    
    new_user = User(
        email=user_dict["email"],
        first_name=user_dict["first_name"],
        last_name=user_dict["last_name"],
        hashed_password=user_dict["password"], 
        business_name=user_dict.get("business_name"),
        business_address=user_dict.get("business_address"),
        tax_id=user_dict.get("tax_id"),
        website=user_dict.get("website"),
        is_verified=True, 
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    await redis_client.delete(temp_user_key)
    
    token = create_access_token(data={"sub": str(new_user.id)})
    
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=COOKIE_MAX_AGE,
        secure=COOKIE_SECURE,     
        samesite=COOKIE_SAMESITE,
        path="/" 
    )
    
    return Token(access_token="", token_type="bearer", user=UserResponse.model_validate(new_user))


@router.post(
    "/login", 
    response_model=Token,
    dependencies=[Depends(RateLimiter(times=5, seconds=60))] 
)
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
        secure=COOKIE_SECURE,     
        samesite=COOKIE_SAMESITE,
        path="/" 
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
        samesite=COOKIE_SAMESITE, 
        secure=COOKIE_SECURE,
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
    if not current_user.hashed_password or not verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    if password_data.old_password == password_data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as the old password"
        )

    current_user.hashed_password = hash_password(password_data.new_password)
    current_user.updated_at = datetime.now(timezone.utc)
    
    session.add(current_user)
    session.commit()
    
    return {"message": "Password updated successfully"}


@router.post("/session")
def set_session_cookie(
    response: Response,
    request: TokenExchangeRequest
):
    """
    Exchange a raw token for a HttpOnly cookie.
    Used for OAuth flows where redirect cookies are blocked.
    """
    response.set_cookie(
        key=COOKIE_NAME,
        value=request.access_token,
        httponly=True,
        max_age=COOKIE_MAX_AGE,
        expires=COOKIE_MAX_AGE,
        secure=COOKIE_SECURE,     
        samesite=COOKIE_SAMESITE, 
    )
    return {"status": "success"}


@router.post(
    "/forgot-password", 
    dependencies=[Depends(RateLimiter(times=3, seconds=60))]
)
async def forgot_password(
    request: ForgotPasswordRequest,
    session: Session = Depends(get_session),
    redis_client: Redis = Depends(get_redis)
):
    """
    Initiates password reset flow.
    """
    statement = select(User).where(User.email == request.email)
    user = session.exec(statement).first()
    
    if not user:
        # Return success even if email doesn't exist (Security: user enumeration prevention)
        return {"message": "If an account exists, a reset link has been sent."}
        
    token = str(uuid4())
    
    redis_key = f"reset:{token}"
    
    await redis_client.set(redis_key, user.email, ex=900) 
    
    await send_password_reset_email(user.email, token)
    
    return {"message": "If an account exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    session: Session = Depends(get_session),
    redis_client: Redis = Depends(get_redis)
):
    """
    Completes password reset using the token from email.
    """
    redis_key = f"reset:{request.token}"
    
    stored_email = await redis_client.get(redis_key)
    
    if not stored_email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    if stored_email != request.email:
        raise HTTPException(status_code=400, detail="Invalid token for this email")
        
    statement = select(User).where(User.email == stored_email)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = hash_password(request.new_password)
    user.updated_at = datetime.now(timezone.utc)
    
    session.add(user)
    session.commit()
    
    await redis_client.delete(redis_key)
    
    return {"message": "Password reset successfully. You can now login."}