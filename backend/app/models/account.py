"""Models for the personal account: the profile snapshot and the saved
cosmetic bag (PBI-403 / PBI-404).

A signed-in user has exactly one saved bag. It is a snapshot of the
questionnaire request and the resulting products, augmented with per-item
state that later PBIs fill in (feedback in PBI-406, replacement in PBI-414).
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel

from app.models.product import Justification, ProductOut, RecommendRequest


class ProfileOut(BaseModel):
    """The profile card ("плашка"), taken from the user's latest questionnaire."""

    age: Optional[int] = None
    skin_type: Optional[str] = None
    concerns: list[str] = []
    allergens: list[str] = []
    vegan: bool = False
    cruelty_free: bool = False
    minimalism: bool = False
    budget: str
    conditions: list[str] = []
    updated_at: datetime


class CareItem(BaseModel):
    """One product slot in the saved bag."""

    product: ProductOut
    concern_match: int
    justification: Justification
    status: Literal["active", "replaced"] = "active"
    feedback: Optional[Literal["liked", "disliked"]] = None
    comment: Optional[str] = None


class CareOut(BaseModel):
    """The saved cosmetic bag returned to the account."""

    request: RecommendRequest
    items: list[CareItem]
    total_price_rub: float
    note: Optional[str] = None
    empty_steps: list[str] = []
    replacements: dict[str, int] = {}
    updated_at: datetime
