from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.api.deps import CurrentUser, DbSession, require_staff
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserListResponse, UserPublic, UserUpdateRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])

StaffUser = Annotated[User, Depends(require_staff)]


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: DbSession) -> TokenResponse:
    return AuthService(db).register(payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DbSession) -> TokenResponse:
    return AuthService(db).login(payload)


@router.get("/me", response_model=UserPublic)
def me(current_user: CurrentUser) -> UserPublic:
    return UserPublic.model_validate(current_user)


@router.get("/users", response_model=UserListResponse)
def list_users(
    db: DbSession,
    _staff: StaffUser,
    role: Annotated[
        UserRole | None,
        Query(description="Filtrer par rôle (client, styliste, …)"),
    ] = None,
    q: Annotated[str | None, Query(max_length=120)] = None,
    is_active: Annotated[bool | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
) -> UserListResponse:
    """Liste staff des comptes (pour /admin/clients et /admin/stylistes)."""
    return AuthService(db).list_users(
        role=role, q=q, is_active=is_active, limit=limit
    )


@router.patch("/users/{user_id}", response_model=UserPublic)
def update_user(
    user_id: UUID,
    payload: UserUpdateRequest,
    db: DbSession,
    staff: StaffUser,
) -> UserPublic:
    """Activer / suspendre ou changer le rôle (staff)."""
    return AuthService(db).update_user(user_id, payload, actor=staff)
