"""Stockage local des photos de créations (disque + URL publique)."""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config import get_settings

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8 Mo


def media_root() -> Path:
    settings = get_settings()
    root = Path(settings.catalogue_media_root)
    root.mkdir(parents=True, exist_ok=True)
    return root


def public_media_url(filename: str) -> str:
    base = get_settings().catalogue_public_url.rstrip("/")
    return f"{base}/media/{filename}"


async def save_upload(file: UploadFile) -> str:
    content_type = (file.content_type or "").lower()
    extension = ALLOWED_TYPES.get(content_type)
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Type non supporté ({content_type or 'inconnu'}). JPEG, PNG ou WebP.",
        )

    data = await file.read()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fichier vide.",
        )
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image trop lourde (max 8 Mo).",
        )

    filename = f"{uuid.uuid4().hex}{extension}"
    destination = media_root() / filename
    destination.write_bytes(data)
    return public_media_url(filename)


async def save_uploads(files: list[UploadFile]) -> list[str]:
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucune image reçue.",
        )
    if len(files) > 24:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 24 images par envoi.",
        )
    urls: list[str] = []
    for file in files:
        urls.append(await save_upload(file))
    return urls
