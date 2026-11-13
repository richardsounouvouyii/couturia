from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.events.publisher import EventPublisher
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.roles import can_self_register
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserListResponse, UserPublic, UserUpdateRequest
from app.security import create_access_token, hash_password, verify_password


class AuthService:
    def __init__(self, db: Session, events: EventPublisher | None = None) -> None:
        self.users = UserRepository(db)
        self.events = events or EventPublisher()

    def list_users(
        self,
        *,
        role: UserRole | None = None,
        q: str | None = None,
        is_active: bool | None = None,
        limit: int = 100,
    ) -> UserListResponse:
        items = self.users.list_users(
            role=role, q=q, is_active=is_active, limit=limit
        )
        public = [UserPublic.model_validate(u) for u in items]
        return UserListResponse(items=public, total=len(public))

    def update_user(
        self,
        user_id: UUID,
        payload: UserUpdateRequest,
        *,
        actor: User,
    ) -> UserPublic:
        if payload.is_active is None and payload.role is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Aucune modification fournie.",
            )

        user = self.users.get_by_id(user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur introuvable.",
            )

        if payload.role is not None and payload.role != user.role:
            if user.id == actor.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Vous ne pouvez pas modifier votre propre rôle.",
                )
            if (
                payload.role == UserRole.super_admin
                and actor.role != UserRole.super_admin
            ):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Seul un super_admin peut attribuer ce rôle.",
                )
            user = self.users.set_role(user, role=payload.role)

        if payload.is_active is not None and payload.is_active != user.is_active:
            if user.id == actor.id and payload.is_active is False:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Vous ne pouvez pas désactiver votre propre compte.",
                )
            user = self.users.set_active(user, is_active=payload.is_active)

        return UserPublic.model_validate(user)

    def register(self, payload: RegisterRequest) -> TokenResponse:
        role = UserRole(payload.role.value)

        if not can_self_register(role):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce rôle ne peut pas être choisi à l’inscription.",
            )

        if self.users.get_by_email(payload.email) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Un compte existe déjà avec cet e-mail.",
            )

        user = self.users.create(
            email=payload.email,
            password_hash=hash_password(payload.password),
            full_name=payload.full_name,
            role=role,
        )
        self.events.publish(
            "utilisateur.inscrit",
            {
                "user_id": str(user.id),
                "email": user.email,
                "role": user.role.value,
            },
        )
        return self._token_response(user)

    def login(self, payload: LoginRequest) -> TokenResponse:
        user = self.users.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants invalides.",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Compte désactivé.",
            )
        return self._token_response(user)

    def _token_response(self, user: User) -> TokenResponse:
        token = create_access_token(subject=user.id, role=user.role.value)
        return TokenResponse(access_token=token, user=UserPublic.model_validate(user))
