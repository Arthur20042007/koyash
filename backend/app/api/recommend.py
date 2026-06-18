from typing import Optional

from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.core.database import get_database
from app.models.product import (
    BagItem,
    Justification,
    Product,
    ProductOut,
    RecommendMeta,
    RecommendRequest,
    RecommendResponse,
    doc_to_product,
)

router = APIRouter(tags=["recommend"])

BUDGET_TARGETS: dict[str, tuple[float, float]] = {
    "low": (0.0, 3000.0),
    "mid": (0.0, 7000.0),
    "high": (7000.0, float("inf")),
}

# Segment floor: low gets all segments; mid excludes low; high gets only high.
SEGMENT_FLOOR: dict[str, set[str]] = {
    "low":  {"low", "mid", "high"},
    "mid":  {"mid", "high"},
    "high": {"high"},
}

CORE_STEPS = ["cleanse", "tone", "serum", "moisturize", "spf"]
OCCASIONAL_STEPS = ["exfoliant", "mask"]

# ---------------------------------------------------------------------------
# Justification dictionaries (§9)
# ---------------------------------------------------------------------------

STEP_ROLE_RU: dict[str, str] = {
    "cleanse":    "Очищение",
    "tone":       "Тонизирование",
    "serum":      "Сыворотка",
    "moisturize": "Увлажнение",
    "spf":        "SPF-защита",
    "exfoliant":  "Отшелушивание",
    "mask":       "Маска",
}

STEP_FREQUENCY: dict[str, str] = {
    "cleanse":    "Ежедневно",
    "tone":       "Ежедневно",
    "serum":      "Ежедневно",
    "moisturize": "Ежедневно",
    "spf":        "Ежедневно (утро)",
    "exfoliant":  "2–3 раза в неделю",
    "mask":       "1–2 раза в неделю",
}

CONCERN_PHRASE_RU: dict[str, str] = {
    "acne":         "Борется с акне и воспалениями",
    "oiliness":     "Контролирует жирность и матирует кожу",
    "pigmentation": "Осветляет пигментацию и выравнивает тон",
    "aging":        "Поддерживает упругость и снижает видимость морщин",
    "dryness":      "Обеспечивает интенсивное увлажнение",
    "sensitivity":  "Успокаивает и восстанавливает чувствительную кожу",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _concern_match(product: Product, concerns: set[str]) -> int:
    return len(set(product.concerns_addressed) & concerns)


def _to_out(p: Product) -> ProductOut:
    return ProductOut(
        id=p.id,
        name=p.name,
        brand=p.brand,
        price_rub=p.price_rub,
        segment=p.segment,
        link=p.link,
        image_url=p.image_url,
        routine_step=p.routine_step,
        tier=p.tier,
        order_index=p.order_index,
        frequency=STEP_FREQUENCY.get(p.routine_step, "По необходимости"),
        concerns_addressed=p.concerns_addressed,
        main_actives_short=p.main_actives_short,
    )


def _build_justification(
    p: Product,
    concerns: set[str],
    req_vegan: bool,
    req_cruelty_free: bool,
    req_has_allergens: bool,
) -> Justification:
    step_name = STEP_ROLE_RU.get(p.routine_step, p.routine_step)
    if p.tier == "core" and p.order_index is not None:
        role = f"Шаг {p.order_index} из 5 — {step_name}"
    else:
        freq = STEP_FREQUENCY.get(p.routine_step, "По необходимости")
        role = f"{freq} — {step_name}"

    # what_it_does: comma-separated phrases from functional_category,
    # each trimmed at first "(" to strip concentration/detail notes
    what_it_does: list[str] = []
    for part in p.functional_category.split(","):
        phrase = part.split("(")[0].strip()
        if phrase:
            what_it_does.append(phrase)
    what_it_does = what_it_does[:3]

    key_actives = p.main_actives_short[:3]

    why: list[str] = []
    for concern in p.concerns_addressed:
        if concern in concerns and concern in CONCERN_PHRASE_RU:
            why.append(CONCERN_PHRASE_RU[concern])
    if req_vegan and p.vegan:
        why.append("Подходит для веганов")
    if req_cruelty_free and p.cruelty_free == "yes":
        why.append("Cruelty-free")
    if req_has_allergens:
        why.append("Без отмеченных тобой аллергенов")

    return Justification(
        role=role,
        what_it_does=what_it_does,
        key_actives=key_actives,
        why_for_you=why,
    )


# ---------------------------------------------------------------------------
# Base selection (§7)
# ---------------------------------------------------------------------------


def _base_select(
    pool: list[Product], concerns: set[str], minimalism: bool
) -> tuple[list[Product], list[str]]:
    basket: list[Product] = []
    missing: list[str] = []

    for step in CORE_STEPS:
        candidates = [p for p in pool if p.routine_step == step and p.tier == "core"]
        if not candidates:
            missing.append(step)
            continue

        candidates.sort(key=lambda p: (-_concern_match(p, concerns), p.price_rub))

        if step == "serum" and len(concerns) >= 2 and len(candidates) >= 2:
            basket.extend(candidates[:2])
        else:
            basket.append(candidates[0])

    if not minimalism:
        for step in OCCASIONAL_STEPS:
            candidates = [p for p in pool if p.routine_step == step and p.tier == "occasional"]
            if not candidates:
                continue
            candidates.sort(key=lambda p: (-_concern_match(p, concerns), p.price_rub))
            basket.append(candidates[0])

    return basket, missing


# ---------------------------------------------------------------------------
# Downgrade pass — ceiling (low/mid)
# ---------------------------------------------------------------------------


def _best_downgrade(
    basket: list[Product], pool: list[Product], concerns: set[str]
) -> Optional[tuple[int, Product]]:
    basket_ids = {p.id for p in basket}
    best: Optional[tuple[int, Product]] = None
    best_savings = 0.0

    for i, product in enumerate(basket):
        candidates = [
            p for p in pool
            if p.routine_step == product.routine_step
            and p.tier == product.tier
            and p.price_rub < product.price_rub
            and p.id not in basket_ids
        ]
        if not candidates:
            continue

        max_match = max(_concern_match(p, concerns) for p in candidates)
        top = [p for p in candidates if _concern_match(p, concerns) == max_match]
        candidate = min(top, key=lambda p: p.price_rub)
        savings = product.price_rub - candidate.price_rub

        if savings > best_savings:
            best_savings = savings
            best = (i, candidate)

    return best


def _fallback_min_price(
    basket: list[Product], pool: list[Product]
) -> tuple[list[Product], float]:
    new_basket: list[Product] = []
    used_ids: set[str] = set()
    for p in basket:
        candidates = [
            c for c in pool
            if c.routine_step == p.routine_step
            and c.tier == p.tier
            and c.id not in used_ids
        ]
        if candidates:
            best = min(candidates, key=lambda c: c.price_rub)
            new_basket.append(best)
            used_ids.add(best.id)
    return new_basket, sum(p.price_rub for p in new_basket)


def _try_drop_step(
    basket: list[Product],
) -> Optional[tuple[list[Product], float, str]]:
    """Per §8: drop the most expensive product, occasional tier first then core.
    The caller loops until total ≤ hi, so this function doesn't check the target.
    Returns None only when the basket is empty.
    """
    if not basket:
        return None
    for tier in ("occasional", "core"):
        candidates = [i for i, p in enumerate(basket) if p.tier == tier]
        if not candidates:
            continue
        i = max(candidates, key=lambda idx: basket[idx].price_rub)
        new_basket = basket[:i] + basket[i + 1:]
        return new_basket, sum(p.price_rub for p in new_basket), basket[i].routine_step
    return None


def _downgrade_pass(
    basket: list[Product], pool: list[Product], concerns: set[str], hi: float
) -> tuple[list[Product], float, Optional[str], list[str]]:
    basket = list(basket)
    total = sum(p.price_rub for p in basket)
    note: Optional[str] = None
    dropped: list[str] = []

    while total > hi:
        swap = _best_downgrade(basket, pool, concerns)
        if swap is None:
            break
        i, replacement = swap
        basket[i] = replacement
        total = sum(p.price_rub for p in basket)

    if total > hi:
        basket, total = _fallback_min_price(basket, pool)

    while total > hi:
        result = _try_drop_step(basket)
        if result is None:
            break
        basket, total, step_name = result
        dropped.append(step_name)

    if total > hi:
        note = "Не удалось уложиться в бюджет — показаны минимально доступные товары"

    return basket, total, note, dropped


# ---------------------------------------------------------------------------
# Upgrade pass — floor (high)
# ---------------------------------------------------------------------------


def _best_upgrade(
    basket: list[Product], pool: list[Product], concerns: set[str]
) -> Optional[tuple[int, Product]]:
    basket_ids = {p.id for p in basket}
    best: Optional[tuple[int, Product]] = None
    best_gain = 0.0

    for i, product in enumerate(basket):
        current_match = _concern_match(product, concerns)
        candidates = [
            p for p in pool
            if p.routine_step == product.routine_step
            and p.tier == product.tier
            and p.price_rub > product.price_rub
            and p.id not in basket_ids
        ]
        if not candidates:
            continue

        matching = [p for p in candidates if _concern_match(p, concerns) >= current_match]
        working = matching if matching else candidates
        high_seg = [p for p in working if p.segment == "high"]
        final = high_seg if high_seg else working
        candidate = max(final, key=lambda p: p.price_rub)
        gain = candidate.price_rub - product.price_rub

        if gain > best_gain:
            best_gain = gain
            best = (i, candidate)

    return best


def _upgrade_pass(
    basket: list[Product], pool: list[Product], concerns: set[str], lo: float
) -> tuple[list[Product], float]:
    basket = list(basket)
    total = sum(p.price_rub for p in basket)
    while total < lo:
        swap = _best_upgrade(basket, pool, concerns)
        if swap is None:
            break
        i, replacement = swap
        basket[i] = replacement
        total = sum(p.price_rub for p in basket)
    return basket, total


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    db = get_database()

    # Hard filters: vegan and cruelty-free (no segment filter here)
    query: dict = {}
    if request.vegan:
        query["vegan"] = True
    if request.cruelty_free:
        query["cruelty_free"] = "yes"  # "unknown" excluded per spec §4.3

    cursor = db["products"].find(query)
    all_products = [doc_to_product(doc) async for doc in cursor]

    # Allergen filter: case-insensitive, done in Python
    if request.allergens:
        allergens_lower = {a.lower() for a in request.allergens}
        pool = [
            p for p in all_products
            if not any(tok.lower() in allergens_lower for tok in p.allergens_norm)
        ]
    else:
        pool = all_products

    # Segment floor: mid excludes low-segment products; high excludes low+mid
    allowed_segs = SEGMENT_FLOOR[request.budget]
    pool = [p for p in pool if p.segment in allowed_segs]

    lo, hi = BUDGET_TARGETS[request.budget]

    # Guard: high budget requires sufficient premium inventory (§6)
    if request.budget == "high":
        high_count = sum(1 for p in pool if p.segment == "high")
        if high_count < settings.MIN_HIGH_PRODUCTS:
            raise HTTPException(
                status_code=422,
                detail={
                    "error": {
                        "code": "INSUFFICIENT_HIGH_SEGMENT_DATA",
                        "message": (
                            "Недостаточно товаров премиум-сегмента, чтобы собрать "
                            "косметичку под этот бюджет. Попробуйте средний бюджет."
                        ),
                    }
                },
            )

    concerns_set = set(request.concerns)
    basket, missing_steps = _base_select(pool, concerns_set, request.minimalism)

    if not basket:
        raise HTTPException(
            status_code=422,
            detail={
                "error": {
                    "code": "NO_PRODUCTS_AVAILABLE",
                    "message": "После применения фильтров не осталось товаров для формирования косметички.",
                }
            },
        )

    total = sum(p.price_rub for p in basket)
    notes: list[str] = []
    empty_steps: list[str] = list(missing_steps)

    if missing_steps:
        notes.append(f"Нет товаров для шагов: {', '.join(missing_steps)}")

    if total > hi:
        basket, total, budget_note, dropped = _downgrade_pass(basket, pool, concerns_set, hi)
        if budget_note:
            notes.append(budget_note)
        empty_steps.extend(dropped)

    elif total < lo:
        basket, total = _upgrade_pass(basket, pool, concerns_set, lo)
        if total < lo:
            raise HTTPException(
                status_code=422,
                detail={
                    "error": {
                        "code": "INSUFFICIENT_HIGH_SEGMENT_DATA",
                        "message": (
                            "Недостаточно товаров премиум-сегмента, чтобы собрать "
                            "косметичку под этот бюджет. Попробуйте средний бюджет."
                        ),
                    }
                },
            )

    req_has_allergens = bool(request.allergens)

    bag: list[BagItem] = [
        BagItem(
            product=_to_out(p),
            concern_match=_concern_match(p, concerns_set),
            justification=_build_justification(
                p, concerns_set,
                request.vegan, request.cruelty_free, req_has_allergens,
            ),
        )
        for p in basket
    ]
    bag.sort(key=lambda item: (item.product.order_index is None, item.product.order_index or 0))

    budget_range_hi: Optional[float] = None if hi == float("inf") else hi

    return RecommendResponse(
        bag=bag,
        meta=RecommendMeta(
            total_price_rub=round(total, 2),
            budget_range=[lo, budget_range_hi],
            budget=request.budget,
            note="; ".join(notes) if notes else None,
            empty_steps=empty_steps,
        ),
    )
