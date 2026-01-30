import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect_to_mongo():
    global client, database
    try:
        client = AsyncIOMotorClient(
            settings.mongodb_url,
            serverSelectionTimeoutMS=5000
        )
        database = client[settings.database_name]

        # Test connection and create indexes
        # Compound index: unique key per app
        await database.features.create_index([("app_id", 1), ("key", 1)], unique=True)
        logger.info("Connected to MongoDB successfully")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB: {e}")
        logger.warning("Running without database - API will return errors for data operations")
        database = None


async def close_mongo_connection():
    global client
    if client:
        client.close()


def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError("Database not connected. Please check your MONGODB_URL environment variable.")
    return database
