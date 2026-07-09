"""Password hashing and JWT helpers for authentication (ADR-004).

Passwords are hashed with bcrypt and never stored in plain text. Access tokens
are short-lived JWTs (HS256) carrying the user id in the ``sub`` claim.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt

from app.core.config import settings

# bcrypt operates on at most 72 bytes; longer passwords are truncated by the
# algorithm. The register model caps password length, so this is not surprising.
_BCRYPT_MAX_BYTES = 72


def hash_password(password: str) -> str:
    """Return a bcrypt hash for the given plain-text password."""
    pw = password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Return True if the plain-text password matches the stored bcrypt hash."""
    pw = password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    try:
        return bcrypt.checkpw(pw, password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: str) -> str:
    """Create a signed JWT access token for the given user id."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(days=settings.JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def decode_token(token: str) -> Optional[str]:
    """Return the user id from a valid token, or None if invalid/expired."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except jwt.PyJWTError:
        return None
    sub = payload.get("sub")
    return sub if isinstance(sub, str) else None
