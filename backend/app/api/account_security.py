"""Account management and security (PBI-418): edit personal data, change
password, and delete the account.

All endpoints require authentication and operate on the current user. Deleting
the account cascades to the user's saved bag and tracker.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.auth import get_current_user
from app.core.database import get_database
from app.core.security import hash_password, verify_password
from app.models.user import AccountDelete, PasswordChange, ProfileUpdate, UserOut

router = APIRouter(prefix="/account", tags=["account-security"])


def _to_user_out(doc: dict[str, Any]) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        age=doc.get("age"),
        phone=doc.get("phone"),
    )


@router.patch("", response_model=UserOut)
async def update_profile(
    payload: ProfileUpdate,
    user: dict[str, Any] = Depends(get_current_user),
) -> UserOut:
    """Edit personal data (name, email, phone, age). Email must stay unique."""
    db = get_database()
    updates: dict[str, Any] = {}
    if payload.name is not None:
        updates["name"] = payload.name
    if payload.phone is not None:
        updates["phone"] = payload.phone
    if payload.age is not None:
        updates["age"] = payload.age
    if payload.email is not None and payload.email != user["email"]:
        existing = await db["users"].find_one({"email": payload.email})
        if existing is not None and existing["_id"] != user["_id"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Этот email уже занят",
            )
        updates["email"] = payload.email

    if updates:
        await db["users"].update_one({"_id": user["_id"]}, {"$set": updates})
    doc = await db["users"].find_one({"_id": user["_id"]})
    assert doc is not None
    return _to_user_out(doc)


@router.put("/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: PasswordChange,
    user: dict[str, Any] = Depends(get_current_user),
) -> None:
    if not verify_password(payload.current_password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Текущий пароль указан неверно",
        )
    await get_database()["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": hash_password(payload.new_password)}},
    )


@router.post("/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    payload: AccountDelete,
    user: dict[str, Any] = Depends(get_current_user),
) -> None:
    """Delete the account after password confirmation, cascading to the saved
    bag and tracker."""
    if not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пароль указан неверно",
        )
    db = get_database()
    user_id = user["_id"]
    await db["users"].delete_one({"_id": user_id})
    await db["care"].delete_one({"user_id": user_id})
    await db["tracker"].delete_one({"user_id": user_id})
