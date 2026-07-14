"""Password hashing and JWT helpers for authentication (ADR-004).

Passwords are hashed with bcrypt and never stored in plain text. Access tokens
are short-lived JWTs (HS256) carrying the user id in the ``sub`` claim.
"""

import hashlib
import secrets
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


# ---------------------------------------------------------------------------
# Password-reset tokens (US-27)
#
# The reset link carries a high-entropy random token. Only its SHA-256 digest
# is stored, so a leaked database still does not yield a usable reset link.
# (A plain digest is enough here — unlike a password, the token is random and
# long, so it is not brute-forceable.) The token is single-use: the stored
# digest is removed once the password has been changed.
# ---------------------------------------------------------------------------

def hash_reset_token(raw_token: str) -> str:
    """Return the digest stored for a reset token."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def new_reset_token() -> tuple[str, str]:
    """Return ``(raw_token, token_digest)``. Only the digest is ever stored."""
    raw = secrets.token_urlsafe(32)
    return raw, hash_reset_token(raw)


def reset_token_expiry() -> datetime:
    """Absolute expiry for a freshly issued reset token."""
    return datetime.now(timezone.utc) + timedelta(minutes=settings.RESET_TOKEN_TTL_MINUTES)
