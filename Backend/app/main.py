import sys
import os

# Ensure the app and parent directories are in the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

import uvicorn
import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import your route modules
from app.routes import auth, user, admin, mfa
from app.database.base import init_db

# Ensure all frontend development ports and production domains are allowed
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://dinevibe1.vercel.app",
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting DineVibe backend...")
    try:
        # Matches Feature: 'Helper: Initialize Database'
        await init_db()
    except Exception as e:
        print(f"⚠️ Database init failed: {e}")
    yield
    print("🛑 Shutting down DineVibe backend...")

app = FastAPI(
    title="DineVibe SaaS Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Feature: CORS Security
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    try:
        response = await call_next(request)
    except Exception as e:
        print("🔥 UNHANDLED SERVER ERROR:")
        traceback.print_exc()
        error_response = JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )
        origin = request.headers.get("origin", "")
        if origin in ALLOWED_ORIGINS:
            error_response.headers["Access-Control-Allow-Origin"] = origin
            error_response.headers["Access-Control-Allow-Credentials"] = "true"
        return error_response

    # Feature: Security Headers Middleware
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

@app.get("/")
async def health_check():
    return {"status": "ok"}

@app.get("/api/")
async def api_health():
    return {"status": "ok", "message": "API is running"}

# --- ROUTER REGISTRATION ---
# NOTE: Using prefix="/api" means all frontend calls MUST start with /api
# Example: http://localhost:8001/api/auth/verify-otp
# Example: http://localhost:8001/api/mfa/verify

app.include_router(auth.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(mfa.router, prefix="/api")

if __name__ == "__main__":
    # Ensure port 8001 is open and matches your frontend API base URL configuration
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)