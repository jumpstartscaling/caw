"""Auth disabled - no login or API key required."""
from typing import Annotated

from fastapi import Depends


async def get_current_admin() -> str:
    """No-op: auth disabled, always passes."""
    return "admin"
