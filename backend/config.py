from dotenv import load_dotenv
import os

# OAuth
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config

# Load env vars
load_dotenv(".env")

# OAuth config
config = Config('.env')
oauth = OAuth(config)

# DB
DATABASE_URL = os.getenv("DATABASE_URL")

# Check required env vars before registration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))