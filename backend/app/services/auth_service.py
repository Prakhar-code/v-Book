import jwt
import logging
from datetime import datetime, timedelta, timezone
from app.core.config import settings as config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
invalidated_tokens = {}


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=480)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, config.secret_key, algorithm=config.algorithm)
    print("Generated JWT Token:", encoded_jwt)
    return encoded_jwt


def invalidate_token(token: str) -> bool:
    try:
        invalidated_tokens[token] = datetime.now(timezone.utc)
        return True
    except Exception as e:
        logger.error(f"Error invalidating token: {e}")
        return False


def is_token_valid(token: str) -> bool:
    return token not in invalidated_tokens
