from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.creation import Creation, CreationStatus
from app.schemas.creation import CreationCreate


class CreationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_public(
        self,
        *,
        category_id: UUID | None = None,
        atelier_id: UUID | None = None,
        ville: str | None = None,
        q: str | None = None,
    ) -> list[Creation]:
        stmt = (
            select(Creation)
            .options(joinedload(Creation.category))
            .where(
                Creation.is_public.is_(True),
                Creation.status == CreationStatus.publiee,
            )
        )
        if category_id:
            stmt = stmt.where(Creation.category_id == category_id)
        if atelier_id:
            stmt = stmt.where(Creation.atelier_id == atelier_id)
        if ville:
            stmt = stmt.where(Creation.ville.ilike(ville))
        if q:
            stmt = stmt.where(Creation.titre.ilike(f"%{q}%"))
        stmt = stmt.order_by(Creation.created_at.desc())
        return list(self.db.scalars(stmt).unique())

    def get_by_id(self, creation_id: UUID) -> Creation | None:
        stmt = (
            select(Creation)
            .options(joinedload(Creation.category))
            .where(Creation.id == creation_id)
        )
        return self.db.scalar(stmt)

    def create(self, payload: CreationCreate) -> Creation:
        creation = Creation(**payload.model_dump())
        self.db.add(creation)
        self.db.commit()
        self.db.refresh(creation)
        return self.get_by_id(creation.id) or creation
