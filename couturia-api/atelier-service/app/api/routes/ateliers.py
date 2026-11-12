from uuid import UUID

from fastapi import APIRouter, Query

from app.api.deps import DbSession
from app.schemas.atelier import AtelierCreate, AtelierPublic, AtelierUpdate
from app.services.atelier_service import AtelierService

router = APIRouter(prefix="/api/ateliers", tags=["ateliers"])


@router.get("", response_model=list[AtelierPublic])
def list_ateliers(
    db: DbSession,
    ville: str | None = Query(default=None),
    specialite: str | None = Query(default=None),
) -> list[AtelierPublic]:
    return AtelierService(db).list_public(ville=ville, specialite=specialite)


# Avant /{atelier_id} pour ne pas confondre "by-owner" avec un UUID
@router.get("/by-owner/{owner_user_id}", response_model=AtelierPublic)
def get_atelier_by_owner(owner_user_id: UUID, db: DbSession) -> AtelierPublic:
    return AtelierService(db).get_by_owner(owner_user_id)


@router.get("/{atelier_id}", response_model=AtelierPublic)
def get_atelier(atelier_id: UUID, db: DbSession) -> AtelierPublic:
    return AtelierService(db).get_public(atelier_id)


@router.post("", response_model=AtelierPublic, status_code=201)
def create_atelier(payload: AtelierCreate, db: DbSession) -> AtelierPublic:
    return AtelierService(db).create(payload)


@router.patch("/{atelier_id}", response_model=AtelierPublic)
def update_atelier(
    atelier_id: UUID, payload: AtelierUpdate, db: DbSession
) -> AtelierPublic:
    return AtelierService(db).update(atelier_id, payload)
