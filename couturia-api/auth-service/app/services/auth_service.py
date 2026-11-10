from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.events.publisher import EventPublisher
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserPublic
from app.security import create_access_token, hash_password, verify_password


class AuthService:
    def __init__(self, db: Session, events: EventPublisher | None = None) -> None:
        self.users = UserRepository(db)
        self.events = events or EventPublisher()

    def register(self, payload: RegisterRequest) -> TokenResponse:
        if payload.role == UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le rôle admin ne peut pas être auto-attribué.",
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
            role=payload.role,
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
