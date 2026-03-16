from fastapi import APIRouter, Depends, HTTPException
import pyotp
import string
import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from typing import Literal, Optional

from app.database.db import get_db
from app.config.settings import settings
from app.models.user import User
from app.models.password_history import PasswordHistory
from app.schemas.auth import (
    RegisterRequest,
    PasswordLoginRequest,
    OTPVerifyRequest,
    SetPasswordRequest
)
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token
)
from app.services.otp_service import generate_mfa_otp, verify_mfa_otp

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login/password")

def generate_temp_password():
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(10))

@router.post("/register", status_code=201)
async def register_user(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="User already exists")
    
    temp_password = generate_temp_password()
    user = User(
        username=payload.username,
        email=payload.email,
        phone_number=payload.phone_number,
        hashed_password=hash_password(temp_password),
        role=payload.role,
        is_active=True,
        is_mfa_enabled=False,
        must_change_password=True
    )
    db.add(user)
    await db.commit()
    return {"message": "User registered successfully", "temporary_password": temp_password}

@router.post("/login/password")
async def password_login(payload: PasswordLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalars().first()
    
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    
    if user.password_changed_at and user.password_changed_at < datetime.now(timezone.utc) - timedelta(days=90):
        return {"status": "PASSWORD_EXPIRED"}
    
    return {
        "status": "MFA_REQUIRED",
        "email": user.email,
        "available_methods": ["authenticator", "email", "sms"]
    }

class SelectMFARequest(BaseModel):
    email: EmailStr
    method: str # Changed to str to prevent 422 errors on casing mismatches

@router.post("/select-mfa")
async def select_mfa_method(payload: SelectMFARequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Normalize method to lowercase
    method_type = payload.method.lower().strip()
    user.mfa_method = method_type
    await db.commit()
    
    if method_type in ["email", "sms"]:
        if method_type == "sms" and not user.phone_number:
            raise HTTPException(status_code=400, detail="User has no phone number registered")
        
        otp_value = await generate_mfa_otp(db=db, user=user, method=method_type)
        return {"status": "SUCCESS", "dev_otp": otp_value}
    
    if method_type == "authenticator":
        if not user.mfa_secret:
            user.mfa_secret = pyotp.random_base32()
            await db.commit()
        
        totp = pyotp.TOTP(user.mfa_secret)
        return {
            "status": "SUCCESS",
            "qr_url": totp.provisioning_uri(name=user.email, issuer_name="DineVibe"),
            "manual_key": user.mfa_secret
        }
    
    raise HTTPException(status_code=400, detail="Invalid MFA method provided")

@router.post("/verify-otp")
async def verify_otp_route(payload: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    is_verified = False
    
    # Bypass for development or specific MFA types
    if payload.otp == "123456":
        is_verified = True
    elif user.mfa_method == "authenticator":
        if not user.mfa_secret:
            raise HTTPException(status_code=400, detail="MFA not initialized")
        totp = pyotp.TOTP(user.mfa_secret)
        is_verified = totp.verify(payload.otp)
    else:
        # verify_mfa_otp raises an exception if invalid, otherwise continues
        await verify_mfa_otp(db=db, user=user, otp_code=payload.otp)
        is_verified = True

    if not is_verified:
        raise HTTPException(status_code=401, detail="Invalid verification code")

    # Update user status
    user.is_mfa_enabled = True
    user.is_first_login = False
    await db.commit()

    # Capture the must_change_password status
    should_reset = user.must_change_password

    # If they must reset, stop here so frontend can redirect
    if should_reset:
        return {
            "status": "MFA_SETUP_COMPLETE", 
            "must_change_password": True, 
            "email": user.email
        }

    # Otherwise, generate full access
    access_token, _, _ = create_access_token(
        user_id=user.id, 
        role=str(user.role.value),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "status": "SUCCESS", 
        "access_token": access_token, 
        "role": str(user.role.value), 
        "user_name": user.username
    }

@router.post("/set-password")
async def set_password(payload: SetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    history_result = await db.execute(
        select(PasswordHistory).where(PasswordHistory.user_id == user.id)
        .order_by(PasswordHistory.created_at.desc()).limit(5)
    )
    history_entries = history_result.scalars().all()
    
    for entry in history_entries:
        if verify_password(payload.new_password, entry.password_hash):
            raise HTTPException(status_code=400, detail="You cannot reuse your last 5 passwords")
    
    if user.hashed_password:
        db.add(PasswordHistory(user_id=user.id, password_hash=user.hashed_password))
    
    user.hashed_password = hash_password(payload.new_password)
    user.must_change_password = False
    user.password_changed_at = datetime.now(timezone.utc)
    await db.commit()
    
    access_token, _, _ = create_access_token(
        user_id=user.id, 
        role=str(user.role.value),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "status": "SUCCESS", 
        "access_token": access_token, 
        "role": str(user.role.value), 
        "user_name": user.username
    }