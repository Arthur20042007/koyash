from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

_client: AsyncIOMotorClient | None = None


async def connect_db() -> None:
    global _client
    # tz_aware so datetimes read back from Mongo are timezone-aware UTC and can
    # be compared against datetime.now(timezone.utc) (used by the tracker).
    _client = AsyncIOMotorClient(settings.MONGODB_URI, tz_aware=True)


async def close_db() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None


def get_database() -> AsyncIOMotorDatabase:
    if _client is None:
        raise RuntimeError("Database client is not initialized")
    return _client[settings.MONGO_DB_NAME]
