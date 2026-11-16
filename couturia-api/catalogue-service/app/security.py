"""Décodage JWT (même secret / algo que auth-service)."""

from __future__ import annotations

from typing import Any

import jwt

from app.config import get_settings


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    return jwt.decode(
        token,
        settings.auth_jwt_secret,
        algorithms=[settings.auth_jwt_algorithm],
    )
