import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class CreationStatus(str, enum.Enum):
    brouillon = "brouillon"
    publiee = "publiee"
    masquee = "masquee"


class Creation(Base):
    __tablename__ = "creations"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # Références externes (pas de jointure cross-service)
    atelier_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), index=True)
    category_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("categories.id"), index=True
    )
    titre: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    prix_indicatif: Mapped[int | None] = mapped_column(Integer, nullable=True)
    devise: Mapped[str] = mapped_column(String(3), default="XOF")
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # Galerie complète (URLs publiques), la 1re = couverture = image_url
    images: Mapped[list] = mapped_column(JSON, default=list)
    ville: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    status: Mapped[CreationStatus] = mapped_column(
        Enum(CreationStatus, name="creation_status", native_enum=False),
        default=CreationStatus.publiee,
    )
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    category = relationship("Category", back_populates="creations")
