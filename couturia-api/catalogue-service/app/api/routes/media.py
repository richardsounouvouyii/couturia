from fastapi import APIRouter, File, UploadFile

from app.media import save_uploads
from app.schemas.media import MediaUploadResponse

router = APIRouter(prefix="/api/media", tags=["media"])


@router.post("/upload", response_model=MediaUploadResponse)
async def upload_media(
    files: list[UploadFile] = File(..., description="Images JPEG/PNG/WebP"),
) -> MediaUploadResponse:
    urls = await save_uploads(files)
    return MediaUploadResponse(urls=urls)
