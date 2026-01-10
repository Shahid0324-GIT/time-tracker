import redis.asyncio as redis
from config import REDIS_URL

if not REDIS_URL:
    raise ValueError("REDIS_URL environment variable is required")

async def get_redis():
    """
    Creates a connection to the Upstash Redis instance.
    The 'decode_responses=True' ensures we get Strings back, not Bytes.
    """
    return redis.from_url(
        REDIS_URL,
        encoding="utf-8",
        decode_responses=True
    )