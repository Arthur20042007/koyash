"""LLM justification layer (ADR-001): the LLM only *verbalizes* the already-made
rule-based recommendation. It never changes what is selected, and any failure
falls back to the rule-based justification text.

The system prompt is customer-owned and is NOT committed to the repository. It is
loaded at runtime from the ``LLM_SYSTEM_PROMPT`` environment variable, or from a
git-ignored ``backend/llm_system_prompt.txt`` file. If neither is present (or
``LLM_ENABLED`` is false, or there is no API key), the layer is disabled and the
caller keeps the rule-based text.
"""
import json
import os
import urllib.error
import urllib.request
from pathlib import Path
from typing import Optional

from app.core.config import settings

# The user message is just our input-data formatting (field labels), not the
# customer's authored system prompt, so it lives in code.
USER_TEMPLATE = (
    "Тип кожи пользователя: {skin_type}\n"
    "Запрос пользователя (concerns): {concerns}\n\n"
    "Продукт: {name} ({brand})\n"
    "Шаг ухода: {step}\n"
    "Состав (ключевые ингредиенты): {ingredients}\n"
    "Совпадение с запросом (concern_match): {concern_match}\n\n"
    "Напиши короткое обоснование строго по правилам системного промта.\n"
    "Сначала проверь concern_match: если 0 - НЕ упоминай тип кожи и concerns,\n"
    "объясни только функцию шага и одного ингредиента."
)

_system_prompt_cache: Optional[str] = None


def _system_prompt() -> str:
    global _system_prompt_cache
    if _system_prompt_cache is None:
        text = os.environ.get("LLM_SYSTEM_PROMPT", "")
        if not text:
            f = Path(__file__).resolve().parents[2] / "llm_system_prompt.txt"
            if f.exists():
                text = f.read_text(encoding="utf-8")
        _system_prompt_cache = text.strip()
    return _system_prompt_cache


def is_enabled() -> bool:
    """True only when the layer is turned on and fully configured."""
    return bool(settings.LLM_ENABLED and settings.LLM_API and _system_prompt())


def generate_justification(
    *, skin_type: str, concerns: str, name: str, brand: str,
    step: str, ingredients: str, concern_match: int,
) -> Optional[str]:
    """Return the LLM justification text, or None on any problem (caller then
    keeps the rule-based text). Safe to call in a worker thread."""
    if not is_enabled():
        return None
    user = USER_TEMPLATE.format(
        skin_type=skin_type, concerns=concerns, name=name, brand=brand,
        step=step, ingredients=ingredients, concern_match=concern_match,
    )
    body = json.dumps({
        "model": settings.LLM_MODEL,
        "messages": [
            {"role": "system", "content": _system_prompt()},
            {"role": "user", "content": user},
        ],
    }).encode("utf-8")
    req = urllib.request.Request(
        settings.LLM_BASE_URL.rstrip("/") + "/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {settings.LLM_API}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=settings.LLM_TIMEOUT) as resp:
            data = json.load(resp)
        text = data["choices"][0]["message"]["content"].strip()
        return text or None
    except (urllib.error.URLError, KeyError, IndexError, ValueError, TimeoutError):
        return None
