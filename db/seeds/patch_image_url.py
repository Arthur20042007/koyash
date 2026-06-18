# Patch image_url on products in koyash.products.
#
# Usage:
#   1. Fill in IMAGE_URLS below (product_id → URL string).
#   2. Run: python patch_image_url.py
#
# The script is idempotent: re-running overwrites existing values.
# Products not listed keep their current image_url (None or previous value).
#
# To clear an image: set the value to None explicitly in IMAGE_URLS.
#
# Auto-scraping note: goldapple.ru blocks server-side requests with
# anti-bot protection. Filling URLs manually is the reliable path.
# For non-goldapple links (e.g. ru.siberianhealth.com) you could try
# fetching og:image automatically — run a one-off enrichment script
# (e.g. with httpx + BeautifulSoup) and paste results here.

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

DB_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=DB_DIR / ".env")

sys.stdout.reconfigure(encoding="utf-8")

# ---------------------------------------------------------------------------
# Fill in your image URLs here. Keys are product_id values from the DB.
# Leave the dict empty to do a dry-run that only prints current state.
# ---------------------------------------------------------------------------
IMAGE_URLS: dict[str, str | None] = {
    # "product_001": "https://example.com/img/product_001.jpg",
    # "product_002": "https://example.com/img/product_002.jpg",
    # "product_003": None,  # clears the image
}

# ---------------------------------------------------------------------------
# Connect
# ---------------------------------------------------------------------------
uri = os.getenv("MONGODB_URI")
db_name = os.getenv("DB_NAME")
client = MongoClient(uri, serverSelectionTimeoutMS=5000)
db = client[db_name]
col = db["products"]

# ---------------------------------------------------------------------------
# Patch
# ---------------------------------------------------------------------------
if not IMAGE_URLS:
    print("IMAGE_URLS is empty — dry run. Showing current image_url state:\n")
    for doc in col.find({}, {"_id": 1, "name": 1, "image_url": 1}):
        val = doc.get("image_url")
        status = "set" if val else "null"
        print(f"  {doc['_id']}  [{status}]  {doc['name']}")
    client.close()
    sys.exit(0)

updated = 0
for product_id, url in IMAGE_URLS.items():
    result = col.update_one({"_id": product_id}, {"$set": {"image_url": url}})
    if result.matched_count == 0:
        print(f"WARNING: {product_id!r} not found in DB — skipped")
    else:
        updated += 1

print(f"Patched image_url on {updated} product(s).")
client.close()
