"""Stockage des photos de créations (Cloudinary en prod, disque en local)."""

from __future__ import annotations

import hashlib
import io
import time
import uuid
from pathlib import Path

import httpx
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


async def _save_local(data: bytes, extension: str) -> str:
    filename = f"{uuid.uuid4().hex}{extension}"
    destination = media_root() / filename
    destination.write_bytes(data)
    return public_media_url(filename)


def _cloudinary_signature(params: dict[str, str], api_secret: str) -> str:
    payload = "&".join(f"{key}={params[key]}" for key in sorted(params))
    return hashlib.sha1(f"{payload}{api_secret}".encode("utf-8")).hexdigest()


async def _save_cloudinary(data: bytes, content_type: str, extension: str) -> str:
    settings = get_settings()
    public_id = uuid.uuid4().hex
    timestamp = str(int(time.time()))
    to_sign = {
        "folder": settings.cloudinary_folder,
        "public_id": public_id,
        "timestamp": timestamp,
    }
    signature = _cloudinary_signature(to_sign, settings.cloudinary_api_secret)
    upload_url = (
        f"https://api.cloudinary.com/v1_1/{settings.cloudinary_cloud_name}/image/upload"
    )
    filename = f"{public_id}{extension}"
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                upload_url,
                data={
                    **to_sign,
                    "api_key": settings.cloudinary_api_key,
                    "signature": signature,
                },
                files={"file": (filename, io.BytesIO(data), content_type)},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Impossible d’envoyer l’image vers Cloudinary.",
        ) from exc

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Échec upload Cloudinary.",
        )

    secure_url = response.json().get("secure_url")
    if not secure_url:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Réponse Cloudinary invalide.",
        )
    return str(secure_url)


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

    settings = get_settings()
    if settings.cloudinary_enabled:
        return await _save_cloudinary(data, content_type, extension)
    return await _save_local(data, extension)


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
