# Fill in skintype on every product in koyash.products.
# Source: the "skintype" sheet in db/data/Koyash.xlsx — customer-provided
# annotation, keyed by product_id (plan B-19, F: "_id-keyed update").
# Idempotent: always overwrites, never appends — safe to re-run.

import json
import os
import sys
from pathlib import Path

import openpyxl
from dotenv import load_dotenv
from pymongo import MongoClient

DB_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=DB_DIR / ".env")

sys.stdout.reconfigure(encoding="utf-8")

XLSX_PATH = DB_DIR / "data" / "Koyash.xlsx"
SHEET_NAME = "skintype"

# Closed vocabulary observed in the source sheet — fail loudly on anything else
# so a typo in the spreadsheet can't silently introduce a stray tag.
KNOWN_SKINTYPES = {"normal", "dry", "oily", "combination", "sensitive", "any"}


def load_skintype_map() -> dict[str, list[str]]:
    wb = openpyxl.load_workbook(XLSX_PATH, data_only=True)
    ws = wb[SHEET_NAME]
    rows = list(ws.iter_rows(min_row=2, values_only=True))  # skip header

    result: dict[str, list[str]] = {}
    for row in rows:
        product_id, _name, _brand, _link, skintype_raw = row[:5]
        if not product_id:
            continue
        tags = [t.strip().lower() for t in (skintype_raw or "").split(",") if t.strip()]
        unknown = [t for t in tags if t not in KNOWN_SKINTYPES]
        if unknown:
            print(f"FAIL: {product_id} has unknown skintype tag(s) {unknown!r} — aborting.")
            sys.exit(1)
        result[product_id] = tags
    return result


skintype_map = load_skintype_map()

# ---------------------------------------------------------------------------
# Connect
# ---------------------------------------------------------------------------
uri = os.getenv("MONGODB_URI")
db_name = os.getenv("DB_NAME")
client = MongoClient(uri, serverSelectionTimeoutMS=5000)
db = client[db_name]
col = db["products"]

all_docs = list(col.find({}, {"_id": 1}))
if len(all_docs) != 69:
    print(f"FAIL: expected 69 products, found {len(all_docs)}. Aborting.")
    client.close()
    sys.exit(1)

db_ids = {doc["_id"] for doc in all_docs}
sheet_ids = set(skintype_map)
if db_ids != sheet_ids:
    print("FAIL: product_id sets differ between DB and the skintype sheet.")
    print("  in DB but not sheet:", sorted(db_ids - sheet_ids))
    print("  in sheet but not DB:", sorted(sheet_ids - db_ids))
    client.close()
    sys.exit(1)

# ---------------------------------------------------------------------------
# Patch
# ---------------------------------------------------------------------------
tag_counts: dict[str, int] = {tag: 0 for tag in KNOWN_SKINTYPES}
empty_products: list[str] = []

for product_id, tags in skintype_map.items():
    col.update_one({"_id": product_id}, {"$set": {"skintype": tags}})
    for tag in tags:
        tag_counts[tag] += 1
    if not tags:
        empty_products.append(product_id)

print(f"Patched skintype on {len(skintype_map)} products.\n")

print("=== Per-tag counts ===")
for tag in sorted(tag_counts):
    print(f"  {tag:<12} {tag_counts[tag]:>3}")
print()

if empty_products:
    print(f"=== Products with empty skintype: {len(empty_products)} ===")
    for pid in sorted(empty_products):
        print(f"  {pid}")
    print()

# ---------------------------------------------------------------------------
# Re-apply the $jsonSchema validator (collMod) — description text was
# updated in schemas/products.json to reflect that skintype is now filled.
# ---------------------------------------------------------------------------
schema_path = DB_DIR / "schemas" / "products.json"
validator = json.loads(schema_path.read_text(encoding="utf-8"))

db.command(
    "collMod",
    "products",
    validator=validator,
    validationLevel="strict",
    validationAction="error",
)
print(f"Validator re-applied from {schema_path.name}.")

client.close()
