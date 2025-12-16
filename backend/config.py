from dotenv import load_dotenv
import os
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config

# ============================================
# LOAD ENVIRONMENT VARIABLES
# ============================================

load_dotenv(".env")

# ============================================
# DATABASE CONFIGURATION
# ============================================

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# ============================================
# JWT CONFIGURATION
# ============================================

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

# ============================================
# OAUTH CONFIGURATION
# ============================================

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Validate OAuth credentials
if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
    print("⚠️  Warning: Google OAuth credentials not set")

if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
    print("⚠️  Warning: GitHub OAuth credentials not set")

# ============================================
# OAUTH CLIENT SETUP
# ============================================

config = Config('.env')
oauth = OAuth(config)

# Register Google OAuth
if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    oauth.register(
        name='google',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'}
    )

# Register GitHub OAuth
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