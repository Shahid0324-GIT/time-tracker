from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from sqlmodel import Session
from db import get_session
from auth import get_or_create_oauth_user, create_access_token
from config import FRONTEND_URL, oauth, COOKIE_NAME, COOKIE_MAX_AGE,COOKIE_SAMESITE, COOKIE_SECURE

router = APIRouter(prefix="/auth", tags=["OAuth"])

@router.get("/google")
async def google_login(request: Request):
    google = oauth.create_client('google')
    if not google:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    redirect_uri = str(request.url_for('google_callback'))
    return await google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, session: Session = Depends(get_session)):
    google = oauth.create_client('google')
    if not google:
        return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=Google OAuth not configured")
    
    try:
        token = await google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=Failed to get user info")
        
        user = get_or_create_oauth_user(
            session=session,
            email=user_info['email'],
            name=user_info.get('name', user_info['email']),
            oauth_provider='google',
            oauth_id=user_info['sub'],
            avatar_url=user_info.get('picture')
        )
        
        access_token = create_access_token(data={"sub": str(user.id)})
        
        # Create Redirect Response
        response = RedirectResponse(url=f"{FRONTEND_URL}/auth/callback") # No token in URL anymore!
        
        # Set HttpOnly Cookie
        response.set_cookie(
            key=COOKIE_NAME,
            value=access_token,
            httponly=True,
            max_age=COOKIE_MAX_AGE,
            expires=COOKIE_MAX_AGE,
            secure=COOKIE_SECURE,     
            samesite=COOKIE_SAMESITE, 
        )
        
        return response
        
    except Exception as e:
        print(f"Google OAuth error: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=Authentication failed")

@router.get("/github")
async def github_login(request: Request):
    github = oauth.create_client('github')
    if not github:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
    
    redirect_uri = str(request.url_for('github_callback'))
    return await github.authorize_redirect(request, redirect_uri)

@router.get("/github/callback")
async def github_callback(request: Request, session: Session = Depends(get_session)):
    github = oauth.create_client('github')
    if not github:
        return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=GitHub OAuth not configured")
    
    try:
        token = await github.authorize_access_token(request)
        resp = await github.get('https://api.github.com/user', token=token)
        user_info = resp.json()
        
        if not user_info:
            return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=Failed to get user info")
        
        email = user_info.get('email')
        if not email:
            email_resp = await github.get('https://api.github.com/user/emails', token=token)
            emails = email_resp.json()
            primary_email = next((e for e in emails if e.get('primary') and e.get('verified')), None)
            if primary_email:
                email = primary_email['email']
            else:
                return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=No verified email found")
        
        user = get_or_create_oauth_user(
            session=session,
            email=email,
            name=user_info.get('name') or user_info.get('login', email),
            oauth_provider='github',
            oauth_id=str(user_info['id']),
            avatar_url=user_info.get('avatar_url')
        )
        
        access_token = create_access_token(data={"sub": str(user.id)})
        
        # Create Redirect Response
        response = RedirectResponse(url=f"{FRONTEND_URL}/auth/callback")
        
        # Set HttpOnly Cookie
        response.set_cookie(
            key=COOKIE_NAME,
            value=access_token,
            httponly=True,
            max_age=COOKIE_MAX_AGE,
            expires=COOKIE_MAX_AGE,
            secure=COOKIE_SECURE,     
            samesite=COOKIE_SAMESITE, 
        )
        
        return response
        
    except Exception as e:
        print(f"GitHub OAuth error: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=Authentication failed")