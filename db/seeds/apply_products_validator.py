# PHASE 4 — attach a JSON-schema validator to the `products` collection.
#
# Why this matters in one line: it makes MongoDB itself enforce the field
# names/types/enums the plan defines, so a bad write (wrong type, typo'd
# enum value, missing field) is rejected immediately with a clear error —
# instead of silently landing in the database and breaking the
# recommendation engine or frontend much later, far from where it happened.
#
# The schema lives in db/schemas/products.json as plain JSON (easy to read
# and diff on its own). This script just loads that file and attaches it to
# the collection that already exists with MongoDB's `collMod` command.
# Note: collMod only affects FUTURE writes — it does not retroactively check
# documents that are already in the collection (that's standard MongoDB
# behaviour, not something this script controls).

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

DB_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=DB_DIR / ".env")

uri = os.getenv("MONGODB_URI")
db_name = os.getenv("DB_NAME")
client = MongoClient(uri, serverSelectionTimeoutMS=5000)
db = client[db_name]

schema_path = DB_DIR / "schemas" / "products.json"
validator = json.loads(schema_path.read_text(encoding="utf-8"))

db.command(
    "collMod",
    "products",
    validator=validator,
    validationLevel="strict",   # check every insert AND every update from now on
    validationAction="error",   # reject (don't just warn about) writes that don't match
)

print(f"Validator from {schema_path.name} attached to '{db_name}.products'.")
print("validationLevel=strict, validationAction=error: non-conforming writes are now rejected.")

client.close()
