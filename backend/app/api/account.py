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
from app.api.recommend import make_bag_item, single_step_alternatives
from app.core.database import get_database
from app.core.tracker import build_tracker_doc
from app.models.account import (
    AlternativesOut,
    CareOut,
    FeedbackIn,
    ProfileOut,
    ReplaceIn,
)
from app.models.product import RecommendRequest, RecommendResponse

router = APIRouter(tags=["account"])

# Maximum number of times a single routine-step product can be replaced.
MAX_REPLACEMENTS = 2


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

    # A new bag starts a new 12-week result tracker (the previous one is reset).
    await db["tracker"].replace_one(
        {"user_id": user_id}, build_tracker_doc(user_id, request, now), upsert=True
    )


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


def _assert_replaceable(care: dict[str, Any], item: dict[str, Any]) -> tuple[str, int]:
    """Replacement is allowed only for an active product marked 'не подошло',
    and at most MAX_REPLACEMENTS times per routine step."""
    if item["status"] != "active" or item.get("feedback") != "disliked":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Замена доступна только после «Не подошло»",
        )
    step = item["product"]["routine_step"]
    used = care.get("replacements", {}).get(step, 0)
    if used >= MAX_REPLACEMENTS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Лимит замен для этой категории исчерпан",
        )
    return step, used


@router.get("/care/items/{product_id}/alternatives", response_model=AlternativesOut)
async def get_alternatives(
    product_id: str,
    user: dict[str, Any] = Depends(get_current_user),
) -> AlternativesOut:
    """Similar products for a disliked item's routine step."""
    care = await _load_care(user)
    item = _find_item(care, product_id)
    step, used = _assert_replaceable(care, item)
    request = RecommendRequest(**care["request"])
    exclude = {it["product"]["id"] for it in care["items"] if it["product"]["routine_step"] == step}
    products = await single_step_alternatives(
        get_database(), request, step, item["product"]["tier"], exclude
    )
    concerns_set = set(request.concerns)
    has_allergens = bool(request.allergens)
    alternatives = [
        make_bag_item(p, concerns_set, request.vegan, request.cruelty_free, has_allergens).product
        for p in products
    ]
    return AlternativesOut(
        step=step,
        alternatives=alternatives,
        replacements_used=used,
        replacements_left=MAX_REPLACEMENTS - used,
    )


@router.post("/care/items/{product_id}/replace", response_model=CareOut)
async def replace_item(
    product_id: str,
    payload: ReplaceIn,
    user: dict[str, Any] = Depends(get_current_user),
) -> CareOut:
    """Swap a disliked product for a chosen similar alternative. The old product
    is kept (dimmed, moved to the bottom) with its comment preserved."""
    care = await _load_care(user)
    old = _find_item(care, product_id)
    step, used = _assert_replaceable(care, old)
    request = RecommendRequest(**care["request"])
    exclude = {it["product"]["id"] for it in care["items"] if it["product"]["routine_step"] == step}
    products = await single_step_alternatives(
        get_database(), request, step, old["product"]["tier"], exclude
    )
    chosen = next((p for p in products if p.id == payload.new_product_id), None)
    if chosen is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Это средство недоступно для замены",
        )

    new_item = make_bag_item(
        chosen, set(request.concerns), request.vegan, request.cruelty_free, bool(request.allergens)
    )
    new_entry = {**new_item.model_dump(), "status": "active", "feedback": None, "comment": None}

    old["status"] = "replaced"
    actives = [it for it in care["items"] if it["status"] == "active"] + [new_entry]
    actives.sort(key=lambda it: (it["product"]["order_index"] is None, it["product"]["order_index"] or 0))
    replaced = [it for it in care["items"] if it["status"] == "replaced"]
    care["items"] = actives + replaced
    care["replacements"] = {**care.get("replacements", {}), step: used + 1}
    care["total_price_rub"] = round(sum(it["product"]["price_rub"] for it in actives), 2)
    care["updated_at"] = datetime.now(timezone.utc)
    await get_database()["care"].replace_one({"user_id": user["_id"]}, care)
    return _to_care_out(care)
