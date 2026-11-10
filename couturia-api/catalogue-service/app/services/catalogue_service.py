from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.events.publisher import EventPublisher
from app.repositories.category_repository import CategoryRepository
from app.repositories.creation_repository import CreationRepository
from app.schemas.category import CategoryCreate, CategoryPublic
from app.schemas.creation import CreationCreate, CreationPublic


class CatalogueService:
    def __init__(self, db: Session, events: EventPublisher | None = None) -> None:
        self.categories = CategoryRepository(db)
        self.creations = CreationRepository(db)
        self.events = events or EventPublisher()

    def list_categories(self) -> list[CategoryPublic]:
        return [
            CategoryPublic.model_validate(item) for item in self.categories.list_all()
        ]

    def create_category(self, payload: CategoryCreate) -> CategoryPublic:
        if self.categories.get_by_slug(payload.slug) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cette catégorie existe déjà.",
            )
        category = self.categories.create(payload)
        return CategoryPublic.model_validate(category)

    def list_creations(
        self,
        *,
        category_id: UUID | None = None,
        atelier_id: UUID | None = None,
        ville: str | None = None,
        q: str | None = None,
    ) -> list[CreationPublic]:
        items = self.creations.list_public(
            category_id=category_id,
            atelier_id=atelier_id,
            ville=ville,
            q=q,
        )
        return [CreationPublic.model_validate(item) for item in items]

    def get_creation(self, creation_id: UUID) -> CreationPublic:
        creation = self.creations.get_by_id(creation_id)
        if creation is None or not creation.is_public:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Création introuvable.",
            )
        return CreationPublic.model_validate(creation)

    def create_creation(self, payload: CreationCreate) -> CreationPublic:
        if self.categories.get_by_id(payload.category_id) is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Catégorie introuvable.",
            )
        creation = self.creations.create(payload)
        self.events.publish(
            "creation.publiee",
            {
                "creation_id": str(creation.id),
                "atelier_id": str(creation.atelier_id),
                "titre": creation.titre,
            },
        )
        return CreationPublic.model_validate(creation)
