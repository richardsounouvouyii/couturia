from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.creation import CreationStatus
from app.schemas.category import CategoryPublic


class CreationCreate(BaseModel):
    atelier_id: UUID
    category_id: UUID
    titre: str = Field(min_length=2, max_length=255)
    description: str | None = None
    prix_indicatif: int | None = Field(default=None, ge=0)
    devise: str = Field(default="XOF", min_length=3, max_length=3)
    image_url: str | None = Field(default=None, max_length=500)
    ville: str | None = Field(default=None, max_length=120)
    status: CreationStatus = CreationStatus.publiee
    is_public: bool = True


class CreationPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    atelier_id: UUID
    category_id: UUID
    titre: str
    description: str | None
    prix_indicatif: int | None
    devise: str
    image_url: str | None
    ville: str | None
    status: CreationStatus
    is_public: bool
    created_at: datetime
    category: CategoryPublic | None = None
