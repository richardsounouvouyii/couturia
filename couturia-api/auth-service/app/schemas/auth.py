from enum import Enum

from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserPublic


class PublicRegisterRole(str, Enum):
    """Rôles autorisés à l'inscription publique (pas admin / super_admin)."""

    client = "client"
    styliste = "styliste"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=255)
    role: PublicRegisterRole = PublicRegisterRole.client


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
