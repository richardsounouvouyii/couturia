"""Appels HTTP vers atelier-service (pas d’accès direct à sa DB)."""

from __future__ import annotations

from uuid import UUID

import httpx
from fastapi import HTTPException, status

from app.config import get_settings


def assert_user_owns_atelier(*, user_id: UUID, atelier_id: UUID) -> None:
    """403 si l’atelier n’existe pas ou n’appartient pas à user_id."""
    base = get_settings().atelier_service_url.rstrip("/")
    url = f"{base}/api/ateliers/{atelier_id}"
    try:
        response = httpx.get(url, timeout=8.0)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Impossible de vérifier l’atelier (service indisponible).",
        ) from exc

    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atelier introuvable.",
        )
    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Réponse invalide d’atelier-service.",
        )

    data = response.json()
    owner = data.get("owner_user_id")
    if str(owner) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cet atelier ne vous appartient pas.",
        )
