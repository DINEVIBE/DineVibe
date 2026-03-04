import uvicorn
import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, user, admin, mfa
from app.database.base import init_db

# -------------------------------------------------
# APP LIFESPAN
# -------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting DineVibe backend...")
    await init_db()   # Ensure tables exist
    yield
    print("🛑 Shutting down DineVibe backend...")

# -------------------------------------------------
# FASTAPI INITIALIZATION
# -------------------------------------------------

app = FastAPI(
    title="DineVibe SaaS Backend",
    version="1.0.0",
    lifespan=lifespan
)

# -------------------------------------------------
# CORS 
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://dinevibe1.vercel.app", # Professional production URL
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -------------------------------------------------
# SECURITY HEADERS (EXCEPTION SAFE)
# -------------------------------------------------

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    try:
        response = await call_next(request)
    except Exception as e:
        print("🔥 UNHANDLED SERVER ERROR:")
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-XSS-Protection"] = "1; mode=block"

    return response

# -------------------------------------------------
# ROUTERS
# -------------------------------------------------

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(admin.router)
app.include_router(mfa.router)

# -------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------

@app.get("/")
async def health_check():
    return {"status": "ok"}

# -------------------------------------------------
# LOCAL DEV
# -------------------------------------------------

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )