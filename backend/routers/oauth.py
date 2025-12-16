from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from sqlmodel import Session
from db import get_session
from auth import get_or_create_oauth_user, create_access_token
from config import FRONTEND_URL, oauth

router = APIRouter(prefix="/auth", tags=["OAuth"])


# ============================================
# GOOGLE OAUTH
# ============================================

@router.get("/google")
async def google_login(request: Request):
    """
    Initiate Google OAuth flow
    Redirects user to Google login page
    """
    google = oauth.create_client('google')
    if not google:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
        )
    
    redirect_uri = str(request.url_for('google_callback'))
    return await google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, session: Session = Depends(get_session)):
    """
    Google OAuth callback
    Exchanges code for user info and creates/logs in user
    """
    google = oauth.create_client('google')
    if not google:
        return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=Google OAuth not configured")
    
    try:
        # Get access token from Google
        token = await google.authorize_access_token(request)
        
        # Get user info (for OIDC like Google)
        user_info = token.get('userinfo')
        
        if not user_info:
            return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=Failed to get user info")
        
        # Optional: Check if email is verified (Google-specific)
        if not user_info.get('email_verified'):
            return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=Unverified email")
        
        # Get or create user
        user = get_or_create_oauth_user(
            session=session,
            email=user_info['email'],
            name=user_info.get('name', user_info['email']),
            oauth_provider='google',
            oauth_id=user_info['sub'],
            avatar_url=user_info.get('picture')
        )
        
        # Create JWT token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        # Redirect to frontend with token
        return RedirectResponse(f"{FRONTEND_URL}/auth/callback?token={access_token}")
        
    except Exception as e:
        print(f"Google OAuth error: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=Authentication failed")


# ============================================
# GITHUB OAUTH
# ============================================

@router.get("/github")
async def github_login(request: Request):
    """
    Initiate GitHub OAuth flow
    Redirects user to GitHub login page
    """
    github = oauth.create_client('github')
    if not github:
        raise HTTPException(
            status_code=500,
            detail="GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET."
        )
    
    redirect_uri = str(request.url_for('github_callback'))
    return await github.authorize_redirect(request, redirect_uri)


@router.get("/github/callback")
async def github_callback(request: Request, session: Session = Depends(get_session)):
    """
    GitHub OAuth callback
    Exchanges code for user info and creates/logs in user
    """
    github = oauth.create_client('github')
    if not github:
        return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=GitHub OAuth not configured")
    
    try:
        # Get access token from GitHub
        token = await github.authorize_access_token(request)
        
        # Get user info from GitHub API
        resp = await github.get('https://api.github.com/user', token=token)
        user_info = resp.json()
        
        if not user_info:
            return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=Failed to get user info")
        
        # GitHub might not provide email in user endpoint, fetch it separately if needed
        email = user_info.get('email')
        if not email:
            email_resp = await github.get('https://api.github.com/user/emails', token=token)
            emails = email_resp.json()
            # Get primary verified email
            primary_email = next((e for e in emails if e.get('primary') and e.get('verified')), None)
            if primary_email:
                email = primary_email['email']
            else:
                return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=No verified email found")
        
        # Get or create user
        user = get_or_create_oauth_user(
            session=session,
            email=email,
            name=user_info.get('name') or user_info.get('login', email),
            oauth_provider='github',
            oauth_id=str(user_info['id']),
            avatar_url=user_info.get('avatar_url')
        )
        
        # Create JWT token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        # Redirect to frontend with token
        return RedirectResponse(f"{FRONTEND_URL}/auth/callback?token={access_token}")
        
    except Exception as e:
        print(f"GitHub OAuth error: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=Authentication failed")