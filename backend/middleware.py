from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_403_FORBIDDEN


class CSRFProtectionMiddleware(BaseHTTPMiddleware):
    """
    Protects against CSRF attacks by requiring a custom header on state-changing requests.
    
    Simple CSRF attacks (forms, img tags) cannot set custom headers due to browser
    security restrictions, so this effectively prevents cookie-based CSRF.
    """
    
    SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
    EXCLUDED_PATHS = {"/docs", "/openapi.json", "/redoc", "/health", "/"}
    
    async def dispatch(self, request: Request, call_next):
        if request.method in self.SAFE_METHODS or request.url.path in self.EXCLUDED_PATHS:
            return await call_next(request)
        
        custom_header = request.headers.get("X-Requested-With")
        
        if custom_header != "XMLHttpRequest":
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN,
                detail="Missing required security header"
            )
        
        return await call_next(request)