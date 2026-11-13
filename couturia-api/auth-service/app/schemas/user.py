from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.user import UserRole


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    # str (pas EmailStr) : un compte legacy invalide ne doit pas casser la liste admin
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime


class UserUpdateRequest(BaseModel):
    """Mise à jour admin (staff) : activation et/ou rôle."""

    is_active: bool | None = None
    role: UserRole | None = None


class UserListResponse(BaseModel):
    items: list[UserPublic]
    total: int = Field(ge=0)
