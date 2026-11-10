from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AtelierCreate(BaseModel):
    owner_user_id: UUID
    nom: str = Field(min_length=2, max_length=255)
    description: str | None = None
    specialite: str = Field(min_length=2, max_length=255)
    ville: str = Field(min_length=2, max_length=120)
    quartier: str | None = Field(default=None, max_length=120)
    telephone_whatsapp: str | None = Field(default=None, max_length=40)
    logo_url: str | None = Field(default=None, max_length=500)
    couverture_url: str | None = Field(default=None, max_length=500)
    is_public: bool = True


class AtelierUpdate(BaseModel):
    nom: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    specialite: str | None = Field(default=None, min_length=2, max_length=255)
    ville: str | None = Field(default=None, min_length=2, max_length=120)
    quartier: str | None = Field(default=None, max_length=120)
    telephone_whatsapp: str | None = Field(default=None, max_length=40)
    logo_url: str | None = Field(default=None, max_length=500)
    couverture_url: str | None = Field(default=None, max_length=500)
    is_public: bool | None = None


class AtelierPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_user_id: UUID
    nom: str
    description: str | None
    specialite: str
    ville: str
    quartier: str | None
    telephone_whatsapp: str | None
    logo_url: str | None
    couverture_url: str | None
    is_public: bool
    created_at: datetime
