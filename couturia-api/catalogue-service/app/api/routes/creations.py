from uuid import UUID

from fastapi import APIRouter, Query

from app.api.deps import DbSession
from app.schemas.creation import CreationCreate, CreationPublic
from app.services.catalogue_service import CatalogueService

router = APIRouter(prefix="/api/creations", tags=["creations"])


@router.get("", response_model=list[CreationPublic])
def list_creations(
    db: DbSession,
    category_id: UUID | None = Query(default=None),
    atelier_id: UUID | None = Query(default=None),
    ville: str | None = Query(default=None),
    q: str | None = Query(default=None),
) -> list[CreationPublic]:
    return CatalogueService(db).list_creations(
        category_id=category_id,
        atelier_id=atelier_id,
        ville=ville,
        q=q,
    )


@router.get("/{creation_id}", response_model=CreationPublic)
def get_creation(creation_id: UUID, db: DbSession) -> CreationPublic:
    return CatalogueService(db).get_creation(creation_id)


@router.post("", response_model=CreationPublic, status_code=201)
def create_creation(payload: CreationCreate, db: DbSession) -> CreationPublic:
    return CatalogueService(db).create_creation(payload)
