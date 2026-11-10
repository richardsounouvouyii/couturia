import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Atelier(Base):
    __tablename__ = "ateliers"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # Référence externe vers auth-service (pas de jointure cross-DB)
    owner_user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), index=True)
    nom: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    specialite: Mapped[str] = mapped_column(String(255))
    ville: Mapped[str] = mapped_column(String(120), index=True)
    quartier: Mapped[str | None] = mapped_column(String(120), nullable=True)
    telephone_whatsapp: Mapped[str | None] = mapped_column(String(40), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    couverture_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
