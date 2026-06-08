# PHASE 3 — import the "Koyash" sheet into MongoDB as the `consultations` collection.
#
# This follows db/docs/KOYASH_data_transformation_plan.md section C exactly.
# Note from the plan: this collection is reference/seed data only —
# "the rule engine never queries this collection."
#
# Steps (mirrors Phase 2's import_products.py):
#   1. Connect to Atlas.
#   2. Read every row of the "Koyash" sheet from Koyash.xlsx.
#   3. Build one document per row: COPY fields unchanged, CONVERT fields to
#      the right type/vocabulary, DERIVE the array fields and total_price_rub.
#   4. Upsert by _id = consultation_id — safe to re-run, never duplicates.

import os
import re
import sys
from pathlib import Path

import openpyxl
from dotenv import load_dotenv
from pymongo import MongoClient

DB_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=DB_DIR / ".env")
sys.stdout.reconfigure(encoding="utf-8")

# ---------------------------------------------------------------------------
# Lookup table for the budget CONVERT (plan section C, row 5)
# ---------------------------------------------------------------------------
BUDGET_MAP = {"low": "low", "medium": "mid", "high": "high"}

NUMBER = re.compile(r"-?\d+(?:\.\d+)?")


def to_number(value):
    """'force numeric' (plan C rows 2 and 10): turn a cell into a float,
    pulling the number out of surrounding text if needed — e.g. cons_027's
    age cell '27 (беременность)' becomes 27.0. None if no number is found."""
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        match = NUMBER.search(value)
        if match:
            return float(match.group())
    return None


def split_list(value):
    """DERIVE a string[] by splitting free text on commas (plan C rows 4 and 9)."""
    if not value:
        return []
    return [piece.strip() for piece in value.split(",") if piece.strip()]


def normalize_allergies(value):
    """COPY with 'blank -> null' (plan C row 6). The sheet writes "no
    allergies" as the literal text 'None' rather than leaving the cell
    empty — we treat that the same way the plan means by "blank"."""
    if value is None:
        return None
    text = str(value).strip()
    if text == "" or text.lower() == "none":
        return None
    return text


# cons_027's age cell holds '27 (беременность)' = '27 (pregnancy)' instead of
# a plain number. Per Daria's call (2026-06-08): store the number (27) in
# `age` via to_number() above, and keep the pregnancy note by appending it to
# that one record's `warning_notes` — already a free-text usage-caution field
# in the plan (C row 12), so nothing new is invented.
EXTRA_WARNING_NOTES = {
    "cons_027": "Возраст в анкете указан как «27 (беременность)».",
}

# ---------------------------------------------------------------------------
# Connect
# ---------------------------------------------------------------------------
uri = os.getenv("MONGODB_URI")
db_name = os.getenv("DB_NAME")
client = MongoClient(uri, serverSelectionTimeoutMS=5000)
db = client[db_name]
consultations = db["consultations"]

# ---------------------------------------------------------------------------
# Read the sheet
# ---------------------------------------------------------------------------
xlsx_path = DB_DIR / "data" / "Koyash.xlsx"
workbook = openpyxl.load_workbook(xlsx_path, data_only=True)
sheet = workbook["Koyash"]
headers = [cell.value for cell in sheet[1]]

upserted = 0

for row in sheet.iter_rows(min_row=2):
    raw = {headers[i]: row[i].value for i in range(len(headers))}
    cid = raw["consultation_id"]

    warning_notes = raw["warning_notes"]
    if cid in EXTRA_WARNING_NOTES:
        extra = EXTRA_WARNING_NOTES[cid]
        warning_notes = f"{warning_notes} {extra}".strip() if warning_notes else extra

    doc = {
        "_id": cid,

        # --- CONVERT: type / vocabulary fixes ---------------------------------
        "age": to_number(raw["age"]),
        "budget": BUDGET_MAP[raw["budget"]],

        # --- COPY: unchanged ----------------------------------------------------
        "skin_type": raw["skin_type"],
        "values": raw["values"],
        "experience": raw["experience"],
        "reasoning": raw["reasoning"],
        "warning_notes": warning_notes,
        "full_reasoning": raw["full_reasoning"],
        "status": raw["status"],            # HOLD: undocumented, not used (plan C row 14)

        # --- COPY with cleanup ---------------------------------------------------
        "allergies": normalize_allergies(raw["allergies"]),

        # --- DERIVE: split free text into arrays ---------------------------------
        "concerns": split_list(raw["concerns"]),
        "products_recommended": split_list(raw["products_recommended"]),

        # --- HOLD + DERIVE: thousands-separator assumption (plan A.6) ------------
        "total_price_raw": raw["total_price"],
        "total_price_rub": round(raw["total_price"] * 1000),
    }

    # Upsert by _id: re-running this script refreshes the same 55 documents
    # in place instead of creating duplicates.
    consultations.replace_one({"_id": doc["_id"]}, doc, upsert=True)
    upserted += 1

print(f"Upserted {upserted} consultations into '{db_name}.consultations'.")

client.close()
