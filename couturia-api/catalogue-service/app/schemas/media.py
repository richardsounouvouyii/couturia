from pydantic import BaseModel, Field


class MediaUploadResponse(BaseModel):
    urls: list[str] = Field(min_length=1)
