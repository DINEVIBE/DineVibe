# app/core/audit.py

from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from models.audit_log import AuditLog


async def create_audit_log(
    db: AsyncSession,
    user_id: int | None,
    action: str,
    details: str,
    ip_address: str | None = None,
):
    """
    Central audit logger.
    Every sensitive action must go through this.
    """

    log = AuditLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=ip_address,
        timestamp=datetime.now(timezone.utc)
    )

    db.add(log)
    await db.commit()


# ===============================
# Predefined Audit Helpers
# ===============================

async def log_login_success(db: AsyncSession, user_id: int, ip: str):
    await create_audit_log(
        db,
        user_id,
        "LOGIN_SUCCESS",
        "User logged in successfully",
        ip
    )


async def log_login_failure(db: AsyncSession, user_id: int | None, ip: str):
    await create_audit_log(
        db,
        user_id,
        "LOGIN_FAILED",
        "Failed login attempt",
        ip
    )


async def log_password_change(db: AsyncSession, user_id: int):
    await create_audit_log(
        db,
        user_id,
        "PASSWORD_CHANGED",
        "User changed password"
    )


async def log_role_change(db: AsyncSession, user_id: int, new_role: str):
    await create_audit_log(
        db,
        user_id,
        "ROLE_CHANGED",
        f"Role updated to {new_role}"
    )
