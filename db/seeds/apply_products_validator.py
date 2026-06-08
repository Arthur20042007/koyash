# Attach a JSON-schema validator to the `products` collection.

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
