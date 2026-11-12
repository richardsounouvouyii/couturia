from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.atelier_repository import AtelierRepository
from app.schemas.atelier import AtelierCreate, AtelierPublic, AtelierUpdate


class AtelierService:
    def __init__(self, db: Session) -> None:
        self.repo = AtelierRepository(db)

    def list_public(
        self,
        *,
        ville: str | None = None,
        specialite: str | None = None,
    ) -> list[AtelierPublic]:
        items = self.repo.list_public(ville=ville, specialite=specialite)
        return [AtelierPublic.model_validate(item) for item in items]

    def get_public(self, atelier_id: UUID) -> AtelierPublic:
        atelier = self.repo.get_by_id(atelier_id)
        if atelier is None or not atelier.is_public:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atelier introuvable.",
            )
        return AtelierPublic.model_validate(atelier)

    def get_by_owner(self, owner_user_id: UUID) -> AtelierPublic:
        atelier = self.repo.get_by_owner_user_id(owner_user_id)
        if atelier is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Aucun atelier pour ce compte.",
            )
        return AtelierPublic.model_validate(atelier)

    def create(self, payload: AtelierCreate) -> AtelierPublic:
        atelier = self.repo.create(payload)
        return AtelierPublic.model_validate(atelier)

    def update(self, atelier_id: UUID, payload: AtelierUpdate) -> AtelierPublic:
        atelier = self.repo.get_by_id(atelier_id)
        if atelier is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atelier introuvable.",
            )
        updated = self.repo.update(atelier, payload)
        return AtelierPublic.model_validate(updated)
