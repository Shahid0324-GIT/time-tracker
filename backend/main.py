from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from db import create_db_and_tables
from routers import auth_routes, users, oauth, clients, projects, time_entries, invoices
from contextlib import asynccontextmanager
from config import SECRET_KEY, FRONTEND_URL, COOKIE_SAMESITE, IS_PRODUCTION, COOKIE_SECURE

# Load environment variables



if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler - runs on startup and shutdown
    """
    # Startup
    print("🚀 Starting Time Tracker API...")
    create_db_and_tables()
    print("✅ Database tables created/verified")
    
    yield  # App is running
    
    # Shutdown (if needed)
    print("👋 Shutting down Time Tracker API...")

# FastAPI App instance
app = FastAPI(
    title="Time Tracker API",
    description="Time tracking and invoice generation API",
    version="1.0.0",
    lifespan=lifespan
)

# 🔍 DEBUG: Check logs in Render Dashboard to see these values
print(f"DEBUG COOKIE: Secure={COOKIE_SECURE}, SameSite={COOKIE_SAMESITE}")
# ============================================
# SESSION MIDDLEWARE (Must be added FIRST for OAuth)
# ============================================
app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    session_cookie="session",
    max_age=3600,  # 1 hour
    same_site=COOKIE_SAMESITE,
    https_only=True if IS_PRODUCTION else False,
)

# ============================================
# CORS MIDDLEWARE
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default
        "https://time-tracker-five-lilac.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# INCLUDE ROUTERS
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


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}