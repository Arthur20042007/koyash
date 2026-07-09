"""Result-tracker endpoints (PBI-416): read the tracker and submit a checkpoint.

Checkpoints unlock by date; only an opened, not-yet-filled checkpoint can be
submitted, and once filled it becomes read-only. A missed but already-opened
checkpoint can still be filled (soft schedule).
"""

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.auth import get_current_user
from app.core.database import get_database
from app.core.tracker import checkpoint_status
from app.models.account import CheckpointIn, CheckpointOut, TrackerOut

router = APIRouter(tags=["tracker"])


async def _load_tracker(user: dict[str, Any]) -> dict[str, Any]:
    doc = await get_database()["tracker"].find_one({"user_id": user["_id"]})
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Трекер появится после сохранения косметички",
        )
    return doc


def _to_tracker_out(doc: dict[str, Any], now: datetime) -> TrackerOut:
    checkpoints = [
        CheckpointOut(
            index=c["index"],
            due_date=c["due_date"],
            status=checkpoint_status(c, now),
            scores=c.get("scores", {}),
            overall=c.get("overall"),
            comment=c.get("comment"),
            filled_at=c.get("filled_at"),
        )
        for c in doc["checkpoints"]
    ]
    return TrackerOut(
        start_date=doc["start_date"],
        criteria=doc["criteria"],
        total_checkpoints=len(checkpoints),
        checkpoints=checkpoints,
    )


@router.get("/tracker", response_model=TrackerOut)
async def get_tracker(user: dict[str, Any] = Depends(get_current_user)) -> TrackerOut:
    return _to_tracker_out(await _load_tracker(user), datetime.now(timezone.utc))


@router.put("/tracker/checkpoints/{index}", response_model=TrackerOut)
async def submit_checkpoint(
    index: int,
    payload: CheckpointIn,
    user: dict[str, Any] = Depends(get_current_user),
) -> TrackerOut:
    now = datetime.now(timezone.utc)
    tracker = await _load_tracker(user)

    checkpoint = next((c for c in tracker["checkpoints"] if c["index"] == index), None)
    if checkpoint is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Нет такого чекпоинта")
    if now < checkpoint["due_date"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Этот чекпоинт ещё не открыт"
        )
    if checkpoint["filled_at"] is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Этот чекпоинт уже заполнен"
        )
    if set(payload.scores.keys()) != set(tracker["criteria"]):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Нужно оценить все критерии трекера",
        )

    checkpoint["scores"] = payload.scores
    checkpoint["overall"] = payload.overall
    checkpoint["comment"] = payload.comment
    checkpoint["filled_at"] = now
    await get_database()["tracker"].replace_one({"user_id": user["_id"]}, tracker)
    return _to_tracker_out(tracker, now)
