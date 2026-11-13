"""Initialisation démarrage (seed admin local)."""

from __future__ import annotations

import logging

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.config import get_settings
from app.models.user import UserRole
from app.repositories.user_repository import UserRepository
from app.security import hash_password

logger = logging.getLogger(__name__)


def seed_admin_if_needed() -> None:
    settings = get_settings()
    email = (settings.auth_seed_admin_email or "").strip().lower()
    password = (settings.auth_seed_admin_password or "").strip()
    if not email or not password:
        return
    if settings.auth_env not in {"development", "dev", "local"}:
        # Sécurité : seed auto seulement en local
        return

    # Timeout court : ne bloque pas le démarrage si Postgres est down
    try:
        engine = create_engine(
            settings.auth_database_url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3},
        )
        Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
        db = Session()
    except Exception:
        logger.warning("Seed admin ignoré : base indisponible au démarrage")
        return

    try:
        db.execute(text("SELECT 1"))
        repo = UserRepository(db)
        existing = repo.get_by_email(email)
        if existing is not None:
            return
        repo.create(
            email=email,
            password_hash=hash_password(password),
            full_name=settings.auth_seed_admin_name,
            role=UserRole.admin,
        )
        logger.info("Compte admin seed créé : %s", email)
    except Exception:
        logger.exception("Échec du seed admin")
    finally:
        db.close()
        engine.dispose()
