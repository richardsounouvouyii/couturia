from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app.db import get_db
from app.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=True)

DbSession = Annotated[Session, Depends(get_db)]

# Rôles autorisés à publier / uploader
PUBLISHER_ROLES = frozenset({"styliste", "admin", "super_admin"})
STAFF_ROLES = frozenset({"admin", "super_admin"})


class TokenUser:
    """Identité extraite du JWT (catalogue n’a pas sa propre table users)."""

    def __init__(self, *, id: UUID, role: str) -> None:
        self.id = id
        self.role = role

    @property
    def is_staff(self) -> bool:
        return self.role in STAFF_ROLES


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
) -> TokenUser:
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = UUID(payload["sub"])
        role = str(payload["role"])
    except (InvalidTokenError, KeyError, ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Jeton invalide ou expiré.",
        ) from exc
    return TokenUser(id=user_id, role=role)


CurrentUser = Annotated[TokenUser, Depends(get_current_user)]


def require_publisher(current_user: CurrentUser) -> TokenUser:
    """Styliste ou staff — pour créer une création / uploader des médias."""
    if current_user.role not in PUBLISHER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Réservé aux stylistes (ou à l’équipe Couturia).",
        )
    return current_user


PublisherUser = Annotated[TokenUser, Depends(require_publisher)]
