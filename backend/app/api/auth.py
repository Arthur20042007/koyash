"""Authentication endpoints (ADR-004): register, login, and current-user.

Guest-first: these endpoints add accounts as an optional layer. The
questionnaire and /recommend flow stay usable without authentication.
"""

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pymongo.errors import DuplicateKeyError

from app.core.config import settings
from app.core.database import get_database
from app.core.mailer import send_email
from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    hash_reset_token,
    new_reset_token,
    reset_token_expiry,
    verify_password,
)
from app.models.user import (
    ForgotPasswordRequest,
    MessageResponse,
    ResetPasswordRequest,
    TokenResponse,
    UserLogin,
    UserOut,
    UserRegister,
)

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
        avatar=doc.get("avatar"),
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
        "avatar": payload.avatar,
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


# The same answer is returned whether or not the address is registered, so the
# endpoint cannot be used to discover which emails have accounts.
_RESET_REQUESTED = (
    "Если аккаунт с таким email существует, мы отправили на него ссылку "
    "для восстановления пароля."
)


def _as_utc(value: datetime) -> datetime:
    """Mongo hands back naive datetimes; treat them as UTC."""
    return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def forgot_password(
    payload: ForgotPasswordRequest, background: BackgroundTasks
) -> MessageResponse:
    """Start a password reset: email a single-use, time-limited link (US-27).

    Answers identically for a known and an unknown address, and a mail failure is
    not surfaced either. The mail is handed to a background task rather than
    awaited, for two reasons: the caller must not wait on a slow (or hanging)
    mail API call, and awaiting it would make a request for a *registered* address
    measurably slower than one for an unknown address — a timing side channel
    that would give away which emails have accounts.
    """
    db = get_database()
    doc = await db["users"].find_one({"email": payload.email})
    if doc is not None:
        raw_token, digest = new_reset_token()
        await db["users"].update_one(
            {"_id": doc["_id"]},
            {"$set": {"reset_token_hash": digest, "reset_expires_at": reset_token_expiry()}},
        )
        link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={raw_token}"
        background.add_task(
            send_email,
            to=payload.email,
            subject="Koyash — восстановление пароля",
            body=(
                f"Привет, {doc.get('name', '')}!\n\n"
                "Мы получили запрос на восстановление пароля в Koyash.\n"
                "Чтобы задать новый пароль, перейди по ссылке:\n\n"
                f"{link}\n\n"
                f"Ссылка действует {settings.RESET_TOKEN_TTL_MINUTES} минут "
                "и сработает только один раз.\n\n"
                "Если запрос был не от тебя — просто проигнорируй это письмо, "
                "пароль останется прежним.\n"
            ),
        )
    return MessageResponse(detail=_RESET_REQUESTED)


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(payload: ResetPasswordRequest) -> MessageResponse:
    """Finish a password reset. The token is single-use and time-limited."""
    db = get_database()
    doc = await db["users"].find_one({"reset_token_hash": hash_reset_token(payload.token)})
    expires_at = doc.get("reset_expires_at") if doc is not None else None
    if doc is None or expires_at is None or _as_utc(expires_at) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ссылка недействительна или устарела. Запроси восстановление ещё раз.",
        )
    await db["users"].update_one(
        {"_id": doc["_id"]},
        {
            "$set": {"password_hash": hash_password(payload.new_password)},
            # Single use: the link stops working once the password is changed.
            "$unset": {"reset_token_hash": "", "reset_expires_at": ""},
        },
    )
    return MessageResponse(detail="Пароль обновлён. Теперь можно войти с новым паролем.")


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


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict[str, Any] | None:
    """Like get_current_user but returns None instead of raising when the
    request carries no valid token. Used by guest-first endpoints such as
    /recommend, which must keep working for anonymous visitors."""
    if credentials is None:
        return None
    user_id = decode_token(credentials.credentials)
    if user_id is None:
        return None
    try:
        oid = ObjectId(user_id)
    except (InvalidId, TypeError):
        return None
    return await get_database()["users"].find_one({"_id": oid})


@router.get("/me", response_model=UserOut)
async def me(user: dict[str, Any] = Depends(get_current_user)) -> UserOut:
    return _to_user_out(user)
