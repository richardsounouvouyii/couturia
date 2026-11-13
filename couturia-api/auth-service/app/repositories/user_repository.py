from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.user import User, UserRole


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: UUID) -> User | None:
        return self.db.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email.lower())
        return self.db.scalar(stmt)

    def list_users(
        self,
        *,
        role: UserRole | None = None,
        q: str | None = None,
        is_active: bool | None = None,
        limit: int = 100,
    ) -> list[User]:
        stmt = select(User).order_by(User.created_at.desc()).limit(max(1, min(limit, 200)))
        if role is not None:
            stmt = stmt.where(User.role == role)
        if is_active is not None:
            stmt = stmt.where(User.is_active.is_(is_active))
        if q:
            needle = f"%{q.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    User.email.ilike(needle),
                    User.full_name.ilike(needle),
                )
            )
        return list(self.db.scalars(stmt).all())

    def create(
        self,
        *,
        email: str,
        password_hash: str,
        full_name: str,
        role: UserRole,
    ) -> User:
        user = User(
            email=email.lower(),
            password_hash=password_hash,
            full_name=full_name.strip(),
            role=role,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def set_active(self, user: User, *, is_active: bool) -> User:
        user.is_active = is_active
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def set_role(self, user: User, *, role: UserRole) -> User:
        user.role = role
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
