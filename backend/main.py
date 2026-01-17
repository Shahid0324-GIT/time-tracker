from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi_limiter import FastAPILimiter

from db import create_db_and_tables
from routers import auth_routes, users, oauth, clients, projects, time_entries, invoices
from contextlib import asynccontextmanager
from config import SECRET_KEY, FRONTEND_URL, IS_PRODUCTION
from lib.redis_instance import get_redis
from middleware import CSRFProtectionMiddleware  

if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler - runs on startup and shutdown"""
    print("🚀 Starting Time Tracker API...")
    create_db_and_tables()
    print("✅ Database tables created/verified")
    
    redis_client = await get_redis()
    await FastAPILimiter.init(redis_client)
    print("✅ Redis Rate Limiter initialized")
    
    yield  
    
    print("👋 Shutting down Time Tracker API...")
    await redis_client.close() 

app = FastAPI(
    title="Time Tracker API",
    description="Time tracking and invoice generation API",
    version="1.0.0",
    lifespan=lifespan
)

# ============================================
# MIDDLEWARE (Order matters!)
# ============================================

# 1. Session Middleware (Must be first for OAuth)
app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    session_cookie="session",
    max_age=3600,
    same_site='none' if IS_PRODUCTION else 'lax',
    https_only=True if IS_PRODUCTION else False,
)

# 2. CSRF Protection
app.add_middleware(CSRFProtectionMiddleware)

# 3. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"]
)

# ============================================
# ROUTERS
# ============================================
app.include_router(auth_routes.router)
app.include_router(users.router)
app.include_router(oauth.router)
app.include_router(clients.router)
app.include_router(projects.router)
app.include_router(time_entries.router)
app.include_router(invoices.router)

# ============================================
# ROOT ENDPOINTS
# ============================================
@app.get("/")
def root():
    """Root endpoint - API info"""
    return {
        "message": "Time Tracker API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}