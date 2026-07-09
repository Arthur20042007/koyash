"""Personal-account persistence: the profile snapshot and the single saved
cosmetic bag (PBI-403 / PBI-404).

When an authenticated user completes the questionnaire, `/recommend` calls
`persist_recommendation`, which stores their latest profile on the user
document and overwrites their one saved bag. Guests trigger no persistence.

Guest carry-over (US-12): a guest who just generated a bag and then signs in
has it carried over by the frontend re-submitting the same questionnaire
answers once authenticated — the call then persists here. The result is
deterministic, so the carried bag matches the guest's result.
"""

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.auth import get_current_user
from app.core.database import get_database
from app.models.account import CareOut, FeedbackIn, ProfileOut
from app.models.product import RecommendRequest, RecommendResponse

router = APIRouter(tags=["account"])


async def persist_recommendation(
    user_id: ObjectId, request: RecommendRequest, response: RecommendResponse
) -> None:
    """Save the user's latest profile snapshot and overwrite their saved bag."""
    db = get_database()
    now = datetime.now(timezone.utc)

    profile = {
        "skin_type": request.skin_type,
        "concerns": request.concerns,
        "allergens": request.allergens,
        "vegan": request.vegan,
        "cruelty_free": request.cruelty_free,
        "minimalism": request.minimalism,
        "budget": request.budget,
        "conditions": request.conditions,
        "updated_at": now,
    }
    update: dict[str, Any] = {"profile": profile}
    if request.age is not None:
        update["age"] = request.age
    await db["users"].update_one({"_id": user_id}, {"$set": update})

    # Overwrite the single saved bag; re-taking the questionnaire clears the
    # previous feedback and replacements.
    items = [
        {**item.model_dump(), "status": "active", "feedback": None, "comment": None}
        for item in response.bag
    ]
    care = {
        "user_id": user_id,
        "request": request.model_dump(),
        "items": items,
        "total_price_rub": response.meta.total_price_rub,
        "note": response.meta.note,
        "empty_steps": response.meta.empty_steps,
        "replacements": {},
        "created_at": now,
        "updated_at": now,
    }
    await db["care"].replace_one({"user_id": user_id}, care, upsert=True)


@router.get("/profile", response_model=ProfileOut)
async def get_profile(user: dict[str, Any] = Depends(get_current_user)) -> ProfileOut:
    profile = user.get("profile")
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль пока не заполнен — пройдите анкету",
        )
    return ProfileOut(age=user.get("age"), **profile)


def _to_care_out(doc: dict[str, Any]) -> CareOut:
    return CareOut(
        request=doc["request"],
        items=doc["items"],
        total_price_rub=doc["total_price_rub"],
        note=doc.get("note"),
        empty_steps=doc.get("empty_steps", []),
        replacements=doc.get("replacements", {}),
        updated_at=doc["updated_at"],
    )


async def _load_care(user: dict[str, Any]) -> dict[str, Any]:
    doc = await get_database()["care"].find_one({"user_id": user["_id"]})
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Косметичка пока не сохранена — пройдите анкету",
        )
    return doc


def _find_item(care: dict[str, Any], product_id: str) -> dict[str, Any]:
    for item in care["items"]:
        if item["product"]["id"] == product_id:
            return item
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Такого средства нет в косметичке",
    )


@router.get("/care", response_model=CareOut)
async def get_care(user: dict[str, Any] = Depends(get_current_user)) -> CareOut:
    return _to_care_out(await _load_care(user))


@router.put("/care/items/{product_id}/feedback", response_model=CareOut)
async def set_feedback(
    product_id: str,
    payload: FeedbackIn,
    user: dict[str, Any] = Depends(get_current_user),
) -> CareOut:
    """Set 'подошло / не подошло' (with a required comment for 'не подошло')."""
    care = await _load_care(user)
    item = _find_item(care, product_id)
    item["feedback"] = payload.feedback
    item["comment"] = payload.comment
    care["updated_at"] = datetime.now(timezone.utc)
    await get_database()["care"].replace_one({"user_id": user["_id"]}, care)
    return _to_care_out(care)


@router.delete("/care/items/{product_id}/feedback", response_model=CareOut)
async def clear_feedback(
    product_id: str,
    user: dict[str, Any] = Depends(get_current_user),
) -> CareOut:
    """Remove the reaction and comment from a product."""
    care = await _load_care(user)
    item = _find_item(care, product_id)
    item["feedback"] = None
    item["comment"] = None
    care["updated_at"] = datetime.now(timezone.utc)
    await get_database()["care"].replace_one({"user_id": user["_id"]}, care)
    return _to_care_out(care)
