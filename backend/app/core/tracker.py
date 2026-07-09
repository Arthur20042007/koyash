"""Result-tracker logic (PBI-416): checkpoint schedule and dynamic criteria.

Six checkpoints, one every two weeks over 12 weeks, tied to the current
cosmetic bag. Criteria are derived from the profile (skin type + concerns) and
are all "negative" symptoms on a 1–5 scale where lower is better. A new bag
starts a new 12-week tracker.
"""

from datetime import datetime, timedelta
from typing import Any

from bson import ObjectId

from app.models.product import RecommendRequest

CHECKPOINT_COUNT = 6
CHECKPOINT_INTERVAL_DAYS = 14  # every two weeks -> weeks 2, 4, 6, 8, 10, 12

# All criteria are symptoms: 1 = none/minimal, 5 = strongly present (lower is
# better), so the whole scale reads in one direction.
_SKIN_CRITERION = {
    "oily": "Жирный блеск",
    "dry": "Сухость и стянутость",
    "sensitive": "Покраснения и раздражение",
    "combination": "Жирный блеск в Т-зоне",
}
_CONCERN_CRITERION = {
    "acne": "Высыпания",
    "oiliness": "Жирный блеск",
    "pigmentation": "Неровный тон",
    "aging": "Морщины и потеря упругости",
    "dryness": "Сухость и стянутость",
    "sensitivity": "Покраснения и раздражение",
}
_CONDITION_CRITERION = {
    "rosacea": "Покраснения и раздражение",
    "dermatitis": "Покраснения и раздражение",
}
_FALLBACK_CRITERIA = ["Сухость и стянутость", "Жирный блеск", "Высыпания"]
_MAX_CRITERIA = 4


def derive_criteria(
    skin_type: str | None, concerns: list[str], conditions: list[str]
) -> list[str]:
    """Pick up to four deduplicated criteria for the given profile, falling back
    to a general trio when nothing specific applies (e.g. normal skin, no
    concerns)."""
    ordered: list[str] = []

    def add(criterion: str | None) -> None:
        if criterion and criterion not in ordered:
            ordered.append(criterion)

    add(_SKIN_CRITERION.get(skin_type or ""))
    for concern in concerns:
        add(_CONCERN_CRITERION.get(concern))
    for condition in conditions:
        add(_CONDITION_CRITERION.get(condition))

    return ordered[:_MAX_CRITERIA] or list(_FALLBACK_CRITERIA)


def build_tracker_doc(
    user_id: ObjectId, request: RecommendRequest, start: datetime
) -> dict[str, Any]:
    """Fresh tracker for a newly saved bag: 6 biweekly checkpoints from `start`."""
    checkpoints: list[dict[str, Any]] = [
        {
            "index": i,
            "due_date": start + timedelta(days=CHECKPOINT_INTERVAL_DAYS * i),
            "scores": {},
            "overall": None,
            "comment": None,
            "filled_at": None,
        }
        for i in range(1, CHECKPOINT_COUNT + 1)
    ]
    return {
        "user_id": user_id,
        "start_date": start,
        "criteria": derive_criteria(request.skin_type, request.concerns, request.conditions),
        "checkpoints": checkpoints,
    }


def checkpoint_status(checkpoint: dict[str, Any], now: datetime) -> str:
    """`done` once filled, `active` once its date has arrived, else `locked`."""
    if checkpoint.get("filled_at") is not None:
        return "done"
    return "active" if now >= checkpoint["due_date"] else "locked"
