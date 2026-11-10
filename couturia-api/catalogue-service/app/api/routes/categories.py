from fastapi import APIRouter

from app.api.deps import DbSession
from app.schemas.category import CategoryCreate, CategoryPublic
from app.services.catalogue_service import CatalogueService

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryPublic])
def list_categories(db: DbSession) -> list[CategoryPublic]:
    return CatalogueService(db).list_categories()


@router.post("", response_model=CategoryPublic, status_code=201)
def create_category(payload: CategoryCreate, db: DbSession) -> CategoryPublic:
    return CatalogueService(db).create_category(payload)
