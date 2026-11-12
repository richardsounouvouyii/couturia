from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.atelier import Atelier
from app.schemas.atelier import AtelierCreate, AtelierUpdate


class AtelierRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_public(
        self,
        *,
        ville: str | None = None,
        specialite: str | None = None,
    ) -> list[Atelier]:
        stmt = select(Atelier).where(Atelier.is_public.is_(True))
        if ville:
            stmt = stmt.where(Atelier.ville.ilike(ville))
        if specialite:
            stmt = stmt.where(Atelier.specialite.ilike(f"%{specialite}%"))
        stmt = stmt.order_by(Atelier.created_at.desc())
        return list(self.db.scalars(stmt))

    def get_by_id(self, atelier_id: UUID) -> Atelier | None:
        return self.db.get(Atelier, atelier_id)

    def get_by_owner_user_id(self, owner_user_id: UUID) -> Atelier | None:
        stmt = (
            select(Atelier)
            .where(Atelier.owner_user_id == owner_user_id)
            .order_by(Atelier.created_at.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()

    def create(self, payload: AtelierCreate) -> Atelier:
        atelier = Atelier(**payload.model_dump())
        self.db.add(atelier)
        self.db.commit()
        self.db.refresh(atelier)
        return atelier

    def update(self, atelier: Atelier, payload: AtelierUpdate) -> Atelier:
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(atelier, key, value)
        self.db.commit()
        self.db.refresh(atelier)
        return atelier
