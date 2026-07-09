"""Authentication endpoints (ADR-004): register, login, and current-user.

Guest-first: these endpoints add accounts as an optional layer. The
questionnaire and /recommend flow stay usable without authentication.
"""

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pymongo.errors import DuplicateKeyError

from app.core.database import get_database
from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import TokenResponse, UserLogin, UserOut, UserRegister

router = APIRouter(prefix="/auth", tags=["auth"])

_bearer = HTTPBearer(auto_error=False)
_UNAUTHORIZED = {"WWW-Authenticate": "Bearer"}


def _to_user_out(doc: dict[str, Any]) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        age=doc.get("age"),
        phone=doc.get("phone"),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister) -> TokenResponse:
    db = get_database()
    if await db["users"].find_one({"email": payload.email}) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким email уже зарегистрирован",
        )
    doc: dict[str, Any] = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "age": payload.age,
        "phone": payload.phone,
        "created_at": datetime.now(timezone.utc),
    }
    try:
        result = await db["users"].insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким email уже зарегистрирован",
        )
    doc["_id"] = result.inserted_id
    # Registration signs the user in immediately.
    token = create_access_token(str(result.inserted_id))
    return TokenResponse(access_token=token, user=_to_user_out(doc))


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin) -> TokenResponse:
    db = get_database()
    doc = await db["users"].find_one({"email": payload.email})
    if doc is None or not verify_password(payload.password, doc.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers=_UNAUTHORIZED,
        )
    token = create_access_token(str(doc["_id"]))
    return TokenResponse(access_token=token, user=_to_user_out(doc))


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict[str, Any]:
    """Resolve the authenticated user from the Bearer token, or raise 401."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется авторизация",
            headers=_UNAUTHORIZED,
        )
    user_id = decode_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный или просроченный токен",
            headers=_UNAUTHORIZED,
        )
    try:
        oid = ObjectId(user_id)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный или просроченный токен",
            headers=_UNAUTHORIZED,
        )
    doc = await get_database()["users"].find_one({"_id": oid})
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
            headers=_UNAUTHORIZED,
        )
    return doc


@router.get("/me", response_model=UserOut)
async def me(user: dict[str, Any] = Depends(get_current_user)) -> UserOut:
    return _to_user_out(user)
