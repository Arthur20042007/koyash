# PHASE 1 — connection test.
# Loads MONGODB_URI / DB_NAME from db/.env, connects to MongoDB Atlas,
# and "pings" the server (a lightweight check that doesn't read or write
# any real data). Prints a clear SUCCESS or FAILED message.

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

# db/.env lives one folder above this script (db/seeds/test_connection.py -> db/.env).
# Spelling out the path means this script works no matter where you run it from.
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

uri = os.getenv("MONGODB_URI")
db_name = os.getenv("DB_NAME")

if not uri:
    print(f"FAILED: MONGODB_URI is not set. Check that {env_path} exists and has a value.")
    sys.exit(1)

client = None
try:
    # serverSelectionTimeoutMS stops us from waiting forever if Atlas is unreachable.
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)

    # "ping" just asks the server "are you there?" — no data is read or written.
    # It's the standard way to verify a connection works.
    client.admin.command("ping")

    print(f"SUCCESS: connected to MongoDB Atlas. Target database will be '{db_name}'.")
except PyMongoError as e:
    print("FAILED: could not connect to MongoDB Atlas.")
    print(f"Details: {e}")
    print("Most common cause: your current IP address is not in the Atlas")
    print("Network Access allowlist (Atlas dashboard -> Network Access -> Add IP Address).")
    sys.exit(1)
finally:
    if client is not None:
        client.close()
