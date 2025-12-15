from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import create_db_and_tables
from routers import auth_routes
from contextlib import asynccontextmanager

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

# ============================================
# CORS MIDDLEWARE
# ============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# ============================================
# INCLUDE ROUTERS
# ============================================

app.include_router(auth_routes.router)

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